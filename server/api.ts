import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import { PaymentProviderRegistry } from './paymentProvider.ts';
import { checkRateLimit, isWebhookProcessed, markWebhookProcessed, isAccessExpired } from './security.ts';
import { Product, Coupon, Order } from '../src/types.ts';

export const apiRouter = Router();

// Rate limiting middleware
apiRouter.use((req: Request, res: Response, next) => {
  const ip = req.ip || '127.0.0.1';
  const { allowed, remaining } = checkRateLimit(ip, 120, 60000);
  res.setHeader('X-RateLimit-Remaining', remaining);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  next();
});

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Explore Payment',
    tagline: 'Create. Get Paid. Unlock.',
    timestamp: new Date().toISOString()
  });
});

// --- PUBLIC PRODUCT PAYMENT PAGE (Redacted Destination URL) ---
apiRouter.get('/p/:creatorSlug/:productSlug', (req, res) => {
  const { creatorSlug, productSlug } = req.params;
  const result = db.getPublicProduct(creatorSlug, productSlug);

  if (!result) {
    return res.status(404).json({ error: 'Product or Creator not found' });
  }

  res.json({
    success: true,
    data: result
  });
});

// --- COUPON VALIDATION ---
apiRouter.post('/coupons/validate', (req, res) => {
  const { code, productId, amount } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const coupon = db.coupons.get(code.trim().toUpperCase());
  if (!coupon || !coupon.isActive) {
    return res.status(400).json({ valid: false, error: 'Invalid or expired coupon code' });
  }

  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ valid: false, error: 'This coupon has expired' });
  }

  if (coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
  }

  const orderAmount = Number(amount) || 0;
  if (orderAmount < coupon.minOrderAmount) {
    return res.status(400).json({
      valid: false,
      error: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, orderAmount);

  res.json({
    valid: true,
    code: coupon.code,
    discountAmount: discount,
    finalAmount: Math.max(0, orderAmount - discount),
    discountType: coupon.discountType,
    discountValue: coupon.discountValue
  });
});

// --- STEP 4: CREATE PAYMENT & UPI QR CODE ---
apiRouter.post('/payment/create', async (req, res) => {
  try {
    const {
      productId,
      customerName,
      customerEmail,
      customerPhone,
      couponCode,
      method = 'upi_qr'
    } = req.body;

    if (!productId || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Missing required customer or product parameters' });
    }

    const product = db.products.get(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product is not available' });
    }

    const creator = db.creators.get(product.creatorId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // Calculate final amount & discount
    let originalPrice = product.price;
    let discountAmount = 0;
    let validatedCoupon = '';

    if (couponCode) {
      const coupon = db.coupons.get(couponCode.trim().toUpperCase());
      if (coupon && coupon.isActive && originalPrice >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((originalPrice * coupon.discountValue) / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, originalPrice);
        validatedCoupon = coupon.code;
        coupon.usedCount += 1;
      }
    }

    const finalAmount = Math.max(1, originalPrice - discountAmount);

    // Create or find customer
    let customer = db.customers.get(customerEmail.toLowerCase());
    if (!customer) {
      customer = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: customerName,
        email: customerEmail.toLowerCase(),
        phone: customerPhone || '',
        createdAt: new Date().toISOString(),
        totalSpent: 0,
        ordersCount: 0
      };
      db.customers.set(customer.id, customer);
      db.customers.set(customer.email, customer);
    } else {
      customer.name = customerName;
      if (customerPhone) customer.phone = customerPhone;
    }

    // Generate Order ID
    const orderId = db.nextOrderId();

    // Select Payment Provider
    const providerType = creator.sellerConfig.provider || 'simulator';
    const provider = PaymentProviderRegistry.getProvider(providerType);

    // Call Provider to create payment request & QR
    const paymentResult = await provider.createPayment({
      orderId,
      amount: finalAmount,
      currency: product.currency || 'INR',
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      productName: product.name,
      creatorUpiId: creator.sellerConfig.upiId || 'explorepay@upi',
      creatorMerchantName: creator.sellerConfig.merchantName || creator.name
    });

    // Create initial Pending Order
    const order: Order = {
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      creatorId: creator.id,
      productId: product.id,
      productName: product.name,
      productCover: product.coverImage,
      amount: finalAmount,
      originalPrice,
      discountAmount,
      couponCode: validatedCoupon || undefined,
      currency: product.currency || 'INR',
      paymentId: paymentResult.paymentId,
      paymentProvider: providerType,
      paymentMethod: method,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.set(orderId, order);

    db.logAudit({
      action: 'PAYMENT_CREATED',
      performedBy: customer.email,
      ipAddress: req.ip || '127.0.0.1',
      details: `Created payment ${paymentResult.paymentId} for Order ${orderId} (₹${finalAmount}) via ${providerType}`
    });

    res.json({
      success: true,
      data: {
        orderId,
        paymentId: paymentResult.paymentId,
        amount: finalAmount,
        currency: product.currency || 'INR',
        upiId: creator.sellerConfig.upiId || 'creator@upi',
        merchantName: creator.sellerConfig.merchantName || creator.name,
        upiString: paymentResult.upiString,
        qrCodeDataUrl: paymentResult.qrCodeDataUrl,
        status: 'PENDING',
        expiresAt: paymentResult.expiresAt
      }
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: error.message || 'Payment initiation failed' });
  }
});

// --- STEP 5: POLL PAYMENT STATUS ---
apiRouter.get('/payment/status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  const order = Array.from(db.orders.values()).find(o => o.paymentId === paymentId);

  if (!order) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  const isSuccess = order.paymentStatus === 'SUCCESS';

  res.json({
    success: true,
    status: order.paymentStatus,
    orderId: order.id,
    paymentId: order.paymentId,
    amount: order.amount,
    accessToken: isSuccess ? order.accessToken : undefined,
    unlockUrl: isSuccess ? `/unlock/${order.accessToken}` : undefined
  });
});

// --- STEP 5 to 6: BACKEND VERIFICATION & SIMULATION ---
// Only trusted backend or provider updates verification
apiRouter.post('/payment/verify', async (req, res) => {
  try {
    const { paymentId, signature } = req.body;
    const order = Array.from(db.orders.values()).find(o => o.paymentId === paymentId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found for given payment ID' });
    }

    if (order.paymentStatus === 'SUCCESS') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        orderId: order.id,
        accessToken: order.accessToken,
        unlockUrl: `/unlock/${order.accessToken}`
      });
    }

    const provider = PaymentProviderRegistry.getProvider(order.paymentProvider);
    const verification = await provider.verifyPayment(paymentId, signature);

    if (verification.success && verification.status === 'SUCCESS') {
      const result = db.completeOrderAndGrantAccess({
        orderId: order.id,
        paymentId,
        providerTxnId: verification.providerTransactionId,
        method: verification.method || order.paymentMethod,
        provider: order.paymentProvider
      });

      return res.json({
        success: true,
        status: 'SUCCESS',
        orderId: order.id,
        accessToken: result?.tokenRecord.accessToken,
        unlockUrl: `/unlock/${result?.tokenRecord.accessToken}`,
        message: '✓ Payment Verified Successfully'
      });
    } else {
      order.paymentStatus = 'FAILED';
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        message: verification.message || 'Payment could not be verified by provider'
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// --- WEBHOOK: PROVIDER INTEGRATION WITH IDEMPOTENCY ---
apiRouter.post('/payment/webhook', async (req, res) => {
  try {
    const signature = (req.headers['x-provider-signature'] || req.headers['x-razorpay-signature'] || '') as string;
    const eventId = req.body.event_id || req.body.id || `evt_${Date.now()}`;

    // IDEMPOTENCY CHECK: Process event only once
    if (isWebhookProcessed(eventId)) {
      return res.json({
        status: 'ignored',
        message: 'Event already processed (Idempotency protection active)'
      });
    }

    const provider = PaymentProviderRegistry.getProvider(req.body.provider || 'simulator');
    const result = await provider.handleWebhook(req.body, signature, JSON.stringify(req.body));

    if (result.success) {
      markWebhookProcessed(eventId);

      // Record webhook event in DB
      db.webhookEvents.set(eventId, {
        id: eventId,
        provider: (req.body.provider || 'simulator') as any,
        providerEventId: eventId,
        eventType: result.eventType,
        paymentId: result.paymentId,
        orderId: result.orderId,
        payload: req.body,
        signature: signature || 'simulated',
        status: 'PROCESSED',
        processedAt: new Date().toISOString()
      });

      // Complete order if it was a payment success event
      if (result.orderId) {
        db.completeOrderAndGrantAccess({
          orderId: result.orderId,
          paymentId: result.paymentId,
          providerTxnId: result.providerTransactionId || `TXN-WB-${Date.now()}`,
          method: 'upi_qr',
          provider: provider.name as any
        });
      }

      return res.json({ status: 'ok', message: 'Webhook processed successfully' });
    } else {
      return res.status(400).json({ status: 'error', message: result.message });
    }
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// --- PAY-TO-UNLOCK SYSTEM: /api/access/:token ---
apiRouter.get('/access/:token', (req, res) => {
  const { token } = req.params;
  const validation = db.validateTokenAndGetContent(token);

  if (!validation.valid || !validation.record) {
    return res.status(403).json({
      success: false,
      status: validation.status,
      error: validation.message || 'Invalid or expired access token'
    });
  }

  const { record, order } = validation;

  res.json({
    success: true,
    status: 'ACTIVE',
    data: {
      tokenId: record.id,
      productName: record.productName,
      productType: record.productType,
      customerName: record.customerName,
      customerEmail: record.customerEmail,
      orderId: record.orderId,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      isLifetime: record.isLifetime,
      destinationUrl: record.destinationUrl, // Validated destination URL!
      customContent: record.customContent,
      fileDetails: record.fileDetails,
      order: order ? {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.createdAt
      } : undefined
    }
  });
});

// --- SECURE FILE DOWNLOAD ---
apiRouter.get('/access/:token/download', (req, res) => {
  const { token } = req.params;
  const validation = db.validateTokenAndGetContent(token);

  if (!validation.valid || !validation.record) {
    return res.status(403).send('Invalid or expired download token.');
  }

  const { record } = validation;
  const fileName = record.fileDetails?.fileName || 'ExplorePayment-DigitalAsset.zip';

  // Set secure download headers
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', record.fileDetails?.mimeType || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  // Provide realistic file payload
  const sampleData = `EXPLORE PAYMENT SECURE DOWNLOAD\nProduct: ${record.productName}\nLicensed To: ${record.customerEmail}\nOrder: ${record.orderId}\nGenerated: ${new Date().toISOString()}\n\nThank you for purchasing via Explore Payment!`;
  res.send(sampleData);
});

// --- INVOICE LOOKUP ---
apiRouter.get('/orders/:orderId/invoice', (req, res) => {
  const { orderId } = req.params;
  const order = db.orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const creator = db.creators.get(order.creatorId);
  const product = db.products.get(order.productId);

  const subtotal = order.originalPrice;
  const discount = order.discountAmount;
  const total = order.amount;
  // GST 18% inclusive calculation
  const taxableAmount = Math.round((total / 1.18) * 100) / 100;
  const gstAmount = Math.round((total - taxableAmount) * 100) / 100;

  res.json({
    success: true,
    invoice: {
      invoiceNumber: `INV-${order.id}`,
      orderId: order.id,
      date: order.createdAt,
      creator: {
        name: creator?.sellerConfig.merchantName || creator?.name || 'Explore Payment Creator',
        email: creator?.email || 'creator@explorepayment.dev',
        upiId: creator?.sellerConfig.upiId || 'creator@upi',
        merchantName: creator?.sellerConfig.merchantName || 'Creator Business'
      },
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone
      },
      product: {
        id: order.productId,
        name: order.productName,
        category: product?.category || 'Digital Good',
        type: product?.productType || 'course'
      },
      pricing: {
        subtotal,
        discount,
        taxableAmount,
        taxes: gstAmount,
        total,
        currency: order.currency
      },
      payment: {
        id: order.paymentId,
        provider: order.paymentProvider,
        method: order.paymentMethod,
        status: order.paymentStatus
      }
    }
  });
});

// --- CREATOR DASHBOARD: PRODUCTS ---
apiRouter.get('/products', (req, res) => {
  const products = Array.from(db.products.values());
  res.json({ success: true, data: products });
});

apiRouter.post('/products', (req, res) => {
  const {
    name,
    description,
    coverImage,
    price,
    discountPrice,
    currency = 'INR',
    category = 'General',
    productType = 'protected_website',
    destinationUrl,
    customContent,
    accessDuration = 'lifetime',
    features = []
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `prod_${Date.now()}`;
  const defaultCreator = Array.from(db.creators.values())[0];

  const newProduct: Product = {
    id,
    creatorId: defaultCreator.id,
    name,
    slug: slug || id,
    description: description || '',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    currency,
    category,
    productType,
    destinationUrl: destinationUrl || 'https://example.com/protected-vault',
    customContent,
    accessDuration,
    features: Array.isArray(features) && features.length > 0 ? features : ['Instant Digital Access', 'Verified Security Protection'],
    isActive: true,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products.set(id, newProduct);

  db.logAudit({
    action: 'PRODUCT_CREATED',
    performedBy: defaultCreator.email,
    ipAddress: req.ip || '127.0.0.1',
    details: `Created product "${newProduct.name}" priced at ₹${newProduct.price}`
  });

  res.json({ success: true, data: newProduct });
});

apiRouter.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = db.products.get(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  product.isActive = false;
  res.json({ success: true, message: 'Product archived' });
});

// --- PAYMENT PAGE BUILDER CONFIG ---
apiRouter.get('/payment-pages/:productId', (req, res) => {
  const { productId } = req.params;
  const config = db.paymentPages.get(productId);
  if (!config) {
    return res.status(404).json({ error: 'Page config not found' });
  }
  res.json({ success: true, data: config });
});

apiRouter.post('/payment-pages/:productId', (req, res) => {
  const { productId } = req.params;
  const existing = db.paymentPages.get(productId);
  const updated = {
    ...existing,
    ...req.body,
    productId
  };
  db.paymentPages.set(productId, updated);
  res.json({ success: true, data: updated });
});

// --- ORDERS & TRANSACTIONS ---
apiRouter.get('/orders', (req, res) => {
  const orders = Array.from(db.orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, data: orders });
});

apiRouter.get('/transactions', (req, res) => {
  const txns = Array.from(db.transactions.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json({ success: true, data: txns });
});

// --- REFUNDS ---
apiRouter.post('/refund', async (req, res) => {
  const { paymentId, orderId, reason } = req.body;
  const order = db.orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.paymentStatus === 'REFUNDED') {
    return res.status(400).json({ error: 'Order is already refunded' });
  }

  const provider = PaymentProviderRegistry.getProvider(order.paymentProvider);
  const refundRes = await provider.refundPayment({
    paymentId: paymentId || order.paymentId,
    orderId: order.id,
    amount: order.amount,
    reason
  });

  if (refundRes.success) {
    order.paymentStatus = 'REFUNDED';
    order.orderStatus = 'REFUNDED';

    // Revoke access token if present
    if (order.accessToken) {
      const tokenRec = db.accessTokens.get(order.accessToken);
      if (tokenRec) {
        tokenRec.status = 'REVOKED';
      }
    }

    db.refunds.set(refundRes.refundId, {
      id: refundRes.refundId,
      orderId: order.id,
      amount: order.amount,
      status: 'SUCCESS',
      reason: reason || 'Customer requested refund',
      createdAt: new Date().toISOString()
    } as any);

    db.logAudit({
      action: 'REFUND_PROCESSED',
      performedBy: 'creator',
      ipAddress: req.ip || '127.0.0.1',
      details: `Refunded ₹${order.amount} for order ${order.id}. Access token revoked.`
    });

    res.json({ success: true, refund: refundRes });
  } else {
    res.status(400).json({ error: refundRes.message });
  }
});

// --- ANALYTICS ---
apiRouter.get('/analytics', (req, res) => {
  const stats = db.getAnalytics();
  res.json({ success: true, data: stats });
});

// --- COUPONS ---
apiRouter.get('/coupons', (req, res) => {
  const coupons = Array.from(db.coupons.values());
  res.json({ success: true, data: coupons });
});

apiRouter.post('/coupons', (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Code and discount value are required' });
  }
  const cleanCode = code.trim().toUpperCase();
  const coupon: Coupon = {
    id: `coup_${Date.now()}`,
    creatorId: Array.from(db.creators.values())[0].id,
    code: cleanCode,
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxUses: Number(maxUses) || 100,
    usedCount: 0,
    expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.coupons.set(cleanCode, coupon);
  res.json({ success: true, data: coupon });
});

// --- SELLER PAYMENT CONFIGURATION ---
apiRouter.get('/seller-config', (req, res) => {
  const creator = Array.from(db.creators.values())[0];
  res.json({
    success: true,
    data: creator.sellerConfig
  });
});

apiRouter.post('/seller-config', (req, res) => {
  const creator = Array.from(db.creators.values())[0];
  const {
    provider,
    upiId,
    merchantName,
    accountHolderName,
    bankName,
    ifscCode,
    gatewayKeyId
  } = req.body;

  creator.sellerConfig = {
    ...creator.sellerConfig,
    provider: provider || creator.sellerConfig.provider,
    upiId: upiId || creator.sellerConfig.upiId,
    merchantName: merchantName || creator.sellerConfig.merchantName,
    accountHolderName: accountHolderName || creator.sellerConfig.accountHolderName,
    bankName: bankName || creator.sellerConfig.bankName,
    ifscCode: ifscCode || creator.sellerConfig.ifscCode,
    gatewayKeyId: gatewayKeyId || creator.sellerConfig.gatewayKeyId
  };

  db.logAudit({
    action: 'SELLER_CONFIG_UPDATED',
    performedBy: creator.email,
    ipAddress: req.ip || '127.0.0.1',
    details: `Updated seller payment config: UPI ID set to ${creator.sellerConfig.upiId}`
  });

  res.json({ success: true, data: creator.sellerConfig });
});

// --- CUSTOMER PURCHASES RETRIEVAL ("My Purchases") ---
apiRouter.get('/customer/purchases', (req, res) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email parameter required' });
  }

  const customerOrders = Array.from(db.orders.values())
    .filter(o => o.customerEmail.toLowerCase() === email && o.paymentStatus === 'SUCCESS')
    .map(order => {
      const token = order.accessToken ? db.accessTokens.get(order.accessToken) : null;
      return {
        orderId: order.id,
        productId: order.productId,
        productName: order.productName,
        productCover: order.productCover,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.createdAt,
        accessToken: order.accessToken,
        tokenStatus: token?.status || 'ACTIVE',
        isExpired: isAccessExpired(token?.expiresAt || null),
        expiresAt: token?.expiresAt || 'Lifetime'
      };
    });

  res.json({ success: true, data: customerOrders });
});

// --- ADMIN DASHBOARD OVERVIEW ---
apiRouter.get('/admin/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      creatorsCount: db.creators.size / 2, // Accounting for id and slug keys
      productsCount: db.products.size,
      ordersCount: db.orders.size,
      customersCount: db.customers.size / 2,
      webhookEvents: Array.from(db.webhookEvents.values()).slice(-20),
      auditLogs: db.auditLogs.slice(0, 30),
      activeProviders: ['simulator', 'direct_upi', 'razorpay', 'cashfree', 'phonepe']
    }
  });
});
