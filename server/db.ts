import {
  CreatorProfile,
  Product,
  PaymentPageConfig,
  Customer,
  Order,
  Transaction,
  AccessTokenRecord,
  Coupon,
  Invoice,
  WebhookEventRecord,
  AuditLog,
  AnalyticsStats,
  Refund
} from '../src/types.ts';
import { generateSignedAccessToken, isAccessExpired } from './security.ts';

class DatabaseStore {
  public creators: Map<string, CreatorProfile> = new Map();
  public products: Map<string, Product> = new Map();
  public paymentPages: Map<string, PaymentPageConfig> = new Map();
  public customers: Map<string, Customer> = new Map();
  public orders: Map<string, Order> = new Map();
  public transactions: Map<string, Transaction> = new Map();
  public accessTokens: Map<string, AccessTokenRecord> = new Map();
  public coupons: Map<string, Coupon> = new Map();
  public refunds: Map<string, Refund> = new Map();
  public webhookEvents: Map<string, WebhookEventRecord> = new Map();
  public auditLogs: AuditLog[] = [];
  public orderCounter = 1001;

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Creator
    const creatorVipul: CreatorProfile = {
      id: 'creator_vipul_001',
      name: 'Vipul Sharma',
      slug: 'vipul',
      email: 'vipul@explorepayment.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Senior Network Engineer & Cloud Architect. Helping 45,000+ engineers pass CCNA and master cloud architectures.',
      tagline: 'Practical networking, real-world packet labs & cloud engineering.',
      website: 'https://vipulnetworks.io',
      verified: true,
      socialLinks: {
        twitter: 'https://twitter.com/vipul_net',
        youtube: 'https://youtube.com/@vipulcloud',
        telegram: 'https://t.me/vipulnetworking'
      },
      sellerConfig: {
        provider: 'simulator',
        upiId: 'vipul@okaxis',
        merchantName: 'Vipul Cloud Academy',
        accountHolderName: 'Vipul Sharma',
        bankName: 'HDFC Bank',
        accountNumberMasked: '•••• •••• 8842',
        ifscCode: 'HDFC0001234',
        gatewayKeyId: 'rzp_live_vipul9918',
        gatewaySecretMasked: '••••••••••••••••'
      }
    };
    this.creators.set(creatorVipul.id, creatorVipul);
    this.creators.set(creatorVipul.slug, creatorVipul);

    // 2. Seed Products
    const product1: Product = {
      id: 'prod_net_course',
      creatorId: creatorVipul.id,
      name: 'Premium Networking Course',
      slug: 'networking-course',
      description: 'Complete CCNA + Networking practical course. 50+ hours of video, interactive packet tracer topologies, subnetting calculators, and real Cisco switch configuration scripts.',
      coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
      price: 499,
      discountPrice: 1999,
      currency: 'INR',
      category: 'Course & Certifications',
      productType: 'protected_website',
      destinationUrl: 'https://vipulcloud.dev/courses/ccna-mastery-vault',
      accessDuration: 'lifetime',
      features: [
        '50+ Hours of On-Demand HD Video Lessons',
        'Interactive Cisco Packet Tracer Lab Topologies',
        'Direct Access to CCNA Exam Prep Simulator',
        'Downloadable CLI Cheat Sheets & Subnetting Guide',
        'Certificate of Completion & LinkedIn Badge'
      ],
      isActive: true,
      salesCount: 142,
      createdAt: '2026-02-15T10:00:00.000Z',
      updatedAt: '2026-03-01T12:00:00.000Z'
    };

    const product2: Product = {
      id: 'prod_ui_kit',
      creatorId: creatorVipul.id,
      name: 'SaaS Design System & Starter Kit',
      slug: 'saas-design-kit',
      description: 'Production-ready Tailwind & Figma design system with 200+ components, accessible contrast, ready-to-use checkout flows, and vector assets.',
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      price: 799,
      discountPrice: 2499,
      currency: 'INR',
      category: 'Digital Asset',
      productType: 'digital_file',
      destinationUrl: 'https://cdn.explorepayment.com/protected/assets/saas-design-system-v4.2.zip',
      fileDetails: {
        fileName: 'Explore-SaaS-Design-System-v4.2.zip',
        fileSize: '42.8 MB',
        mimeType: 'application/zip',
        downloadCount: 89
      },
      accessDuration: 'lifetime',
      features: [
        '200+ Tailwind CSS v4 & React 19 Components',
        'Clean Figma File with Auto-Layout & Variants',
        'Lifetime Updates & GitHub Repo Access',
        'Commercial Use License Included'
      ],
      isActive: true,
      salesCount: 89,
      createdAt: '2026-02-20T10:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z'
    };

    const product3: Product = {
      id: 'prod_devops_vip',
      creatorId: creatorVipul.id,
      name: 'DevOps & Cloud VIP Community Invite',
      slug: 'devops-community',
      description: 'Exclusive Telegram group for Kubernetes engineers, live architecture teardowns, weekly mock interviews, and direct mentor Q&A.',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      price: 299,
      currency: 'INR',
      category: 'Community & Membership',
      productType: 'telegram_community',
      destinationUrl: 'https://t.me/+ExploreDevOpsVIP_901xKz',
      accessDuration: '30_days',
      features: [
        'Private VIP Telegram Group with 1,200+ SREs',
        'Weekly Sunday Live Incident Postmortems',
        'Resume Reviews and Referral Fast-Track',
        'Private GitHub Repos with Production Helm Charts'
      ],
      isActive: true,
      salesCount: 210,
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-03-10T12:00:00.000Z'
    };

    this.products.set(product1.id, product1);
    this.products.set(product2.id, product2);
    this.products.set(product3.id, product3);

    // 3. Payment Page Builders
    const pageConfig1: PaymentPageConfig = {
      id: `page_${product1.id}`,
      productId: product1.id,
      brandName: 'Vipul Cloud Academy',
      logoUrl: creatorVipul.avatar,
      primaryColor: '#2563eb', // Indigo Blue
      accentColor: '#10b981', // Emerald
      backgroundStyle: 'clean_white',
      buttonStyle: 'rounded_pill',
      fontFamily: 'plus_jakarta',
      layout: 'centered_card',
      showFeatures: true,
      showTestimonials: true,
      showFaq: true,
      showTerms: true,
      showRefundPolicy: true,
      customHeading: 'Master Networking & Cisco CCNA in 2026',
      customSubheading: 'Instant access right after verified payment. Start building real lab topologies today.',
      testimonials: [
        {
          name: 'Aman Verma',
          role: 'Junior Network Associate @ Wipro',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          comment: 'Cleared my CCNA on first attempt thanks to Vipul sir’s Packet Tracer labs. Paid ₹499 via UPI QR and got access in 3 seconds!',
          rating: 5
        },
        {
          name: 'Rohit Kulkarni',
          role: 'Cloud Ops @ Infosys',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
          comment: 'Best practical networking content out there. The subnetting cheat sheets alone are worth triple the price.',
          rating: 5
        }
      ],
      faqs: [
        {
          question: 'How quickly will I get access after paying?',
          answer: 'Instantly! As soon as your payment is verified via UPI or Card, Explore Payment securely generates your private access token and redirects you to the course portal.'
        },
        {
          question: 'Can I re-access the course later?',
          answer: 'Yes, your access token grants Lifetime access. You can also re-enter your email on Explore Payment Customer Portal to retrieve all your purchases and invoices anytime.'
        },
        {
          question: 'What if my payment gets stuck?',
          answer: 'All payments are verified in real time against the banking provider. If any network timeout occurs, our webhook system reconciles the transaction automatically.'
        }
      ],
      termsText: 'Access is personal and non-transferable. Sharing credentials will automatically revoke access.',
      refundPolicyText: 'We offer a 7-day satisfaction guarantee if you haven’t accessed more than 20% of the video material.'
    };
    this.paymentPages.set(product1.id, pageConfig1);

    // 4. Seed Coupons
    const coupon1: Coupon = {
      id: 'coup_welcome20',
      creatorId: creatorVipul.id,
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20, // 20% OFF
      minOrderAmount: 200,
      maxUses: 500,
      usedCount: 38,
      expiresAt: '2026-12-31T23:59:59.000Z',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    };

    const coupon2: Coupon = {
      id: 'coup_save100',
      creatorId: creatorVipul.id,
      code: 'FLAT100',
      discountType: 'fixed',
      discountValue: 100, // ₹100 OFF
      minOrderAmount: 400,
      maxUses: 100,
      usedCount: 12,
      expiresAt: '2026-12-31T23:59:59.000Z',
      isActive: true,
      createdAt: '2026-02-01T00:00:00.000Z'
    };

    this.coupons.set(coupon1.code.toUpperCase(), coupon1);
    this.coupons.set(coupon2.code.toUpperCase(), coupon2);

    // 5. Seed Customer & Order
    const customer1: Customer = {
      id: 'cust_rahul_99',
      name: 'Rahul Sen',
      email: 'rahul.sen@example.com',
      phone: '+919876543210',
      createdAt: '2026-03-01T14:20:00.000Z',
      totalSpent: 499,
      ordersCount: 1
    };
    this.customers.set(customer1.id, customer1);
    this.customers.set(customer1.email.toLowerCase(), customer1);

    const seededOrder: Order = {
      id: 'EXP-2026-000001',
      customerId: customer1.id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      creatorId: creatorVipul.id,
      productId: product1.id,
      productName: product1.name,
      productCover: product1.coverImage,
      amount: 499,
      originalPrice: 499,
      discountAmount: 0,
      currency: 'INR',
      paymentId: 'PAY-SIM-INIT-001',
      paymentProvider: 'simulator',
      paymentMethod: 'upi_qr',
      paymentStatus: 'SUCCESS',
      orderStatus: 'COMPLETED',
      accessTokenId: 'tok_demo_seed_001',
      createdAt: '2026-03-01T14:21:00.000Z',
      updatedAt: '2026-03-01T14:21:05.000Z'
    };

    const tokenPayload = generateSignedAccessToken({
      orderId: seededOrder.id,
      customerId: customer1.id,
      productId: product1.id,
      expiresAt: null
    });

    seededOrder.accessToken = tokenPayload.token;
    seededOrder.accessTokenId = tokenPayload.tokenId;
    this.orders.set(seededOrder.id, seededOrder);

    const tokenRecord: AccessTokenRecord = {
      id: tokenPayload.tokenId,
      accessToken: tokenPayload.token,
      orderId: seededOrder.id,
      customerId: customer1.id,
      customerEmail: customer1.email,
      customerName: customer1.name,
      productId: product1.id,
      productName: product1.name,
      productType: product1.productType,
      destinationUrl: product1.destinationUrl!,
      createdAt: seededOrder.createdAt,
      expiresAt: null,
      isLifetime: true,
      status: 'ACTIVE',
      accessCount: 3,
      signature: tokenPayload.signature
    };
    this.accessTokens.set(tokenPayload.token, tokenRecord);
    this.accessTokens.set(tokenPayload.tokenId, tokenRecord);

    const seededTxn: Transaction = {
      id: 'TXN-2026-000001',
      orderId: seededOrder.id,
      creatorId: creatorVipul.id,
      customerId: customer1.id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      productId: product1.id,
      productName: product1.name,
      amount: 499,
      currency: 'INR',
      paymentMethod: 'upi_qr',
      provider: 'simulator',
      providerTransactionId: 'UPI-SIM-88291039',
      status: 'SUCCESS',
      date: seededOrder.createdAt
    };
    this.transactions.set(seededTxn.id, seededTxn);

    // Initial audit log
    this.logAudit({
      action: 'SYSTEM_BOOTSTRAP',
      performedBy: 'system',
      ipAddress: '127.0.0.1',
      details: 'Explore Payment initialized with seeded creator, products, and verified payment flow'
    });
  }

  // --- Audit Logging ---
  public logAudit(entry: { action: string; performedBy: string; ipAddress: string; details: string }) {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action: entry.action,
      performedBy: entry.performedBy,
      ipAddress: entry.ipAddress,
      details: entry.details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  // --- Order Generation ---
  public nextOrderId(): string {
    this.orderCounter += 1;
    return `EXP-2026-${this.orderCounter.toString().padStart(6, '0')}`;
  }

  // --- Public Safe Product Fetch (Hides secret destination URL) ---
  public getPublicProduct(creatorSlug: string, productSlug: string): {
    creator: Partial<CreatorProfile>;
    product: Partial<Product>;
    pageConfig: PaymentPageConfig;
  } | null {
    const creator = Array.from(this.creators.values()).find(
      c => c.slug.toLowerCase() === creatorSlug.toLowerCase()
    );
    if (!creator) return null;

    const product = Array.from(this.products.values()).find(
      p => p.creatorId === creator.id && p.slug.toLowerCase() === productSlug.toLowerCase()
    );
    if (!product || !product.isActive) return null;

    let pageConfig = this.paymentPages.get(product.id);
    if (!pageConfig) {
      pageConfig = {
        id: `page_${product.id}`,
        productId: product.id,
        brandName: creator.name,
        logoUrl: creator.avatar,
        primaryColor: '#2563eb',
        accentColor: '#10b981',
        backgroundStyle: 'clean_white',
        buttonStyle: 'rounded_pill',
        fontFamily: 'plus_jakarta',
        layout: 'centered_card',
        showFeatures: true,
        showTestimonials: false,
        showFaq: true,
        showTerms: true,
        showRefundPolicy: true,
        testimonials: [],
        faqs: [
          {
            question: 'When will I get access?',
            answer: 'Instant access right after payment verification via UPI or Card.'
          }
        ],
        termsText: 'Personal non-transferable access.',
        refundPolicyText: 'Standard creator policy applies.'
      };
      this.paymentPages.set(product.id, pageConfig);
    }

    // REDACT secret destination URL
    const safeProduct: Partial<Product> = {
      id: product.id,
      creatorId: product.creatorId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      coverImage: product.coverImage,
      price: product.price,
      discountPrice: product.discountPrice,
      currency: product.currency,
      category: product.category,
      productType: product.productType,
      accessDuration: product.accessDuration,
      features: product.features,
      isActive: product.isActive,
      salesCount: product.salesCount
      // destinationUrl is purposely omitted for security
    };

    const safeCreator: Partial<CreatorProfile> = {
      id: creator.id,
      name: creator.name,
      slug: creator.slug,
      avatar: creator.avatar,
      bio: creator.bio,
      tagline: creator.tagline,
      verified: creator.verified,
      sellerConfig: {
        provider: creator.sellerConfig.provider,
        upiId: creator.sellerConfig.upiId,
        merchantName: creator.sellerConfig.merchantName
      }
    };

    return {
      creator: safeCreator,
      product: safeProduct,
      pageConfig
    };
  }

  // --- Complete Order & Issue Access Token ---
  public completeOrderAndGrantAccess(params: {
    orderId: string;
    paymentId: string;
    providerTxnId: string;
    method: any;
    provider: any;
  }): { order: Order; tokenRecord: AccessTokenRecord } | null {
    const order = this.orders.get(params.orderId);
    if (!order) return null;

    if (order.orderStatus === 'COMPLETED' && order.accessToken) {
      const existingToken = this.accessTokens.get(order.accessToken);
      if (existingToken) {
        return { order, tokenRecord: existingToken };
      }
    }

    const product = this.products.get(order.productId);
    if (!product) return null;

    // Calculate expiration based on access duration
    let expiresAt: string | null = null;
    let isLifetime = true;

    if (product.accessDuration === '1_day') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === '7_days') {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === '30_days') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === '90_days') {
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === 'custom' && product.customDurationDays) {
      expiresAt = new Date(Date.now() + product.customDurationDays * 24 * 60 * 60 * 1000).toISOString();
      isLifetime = false;
    }

    // Generate cryptographic token
    const tokenInfo = generateSignedAccessToken({
      orderId: order.id,
      customerId: order.customerId,
      productId: product.id,
      expiresAt
    });

    order.paymentStatus = 'SUCCESS';
    order.orderStatus = 'COMPLETED';
    order.paymentId = params.paymentId;
    order.accessToken = tokenInfo.token;
    order.accessTokenId = tokenInfo.tokenId;
    order.updatedAt = new Date().toISOString();

    const tokenRecord: AccessTokenRecord = {
      id: tokenInfo.tokenId,
      accessToken: tokenInfo.token,
      orderId: order.id,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      productId: product.id,
      productName: product.name,
      productType: product.productType,
      destinationUrl: product.destinationUrl || '',
      customContent: product.customContent,
      fileDetails: product.fileDetails,
      createdAt: order.updatedAt,
      expiresAt,
      isLifetime,
      status: 'ACTIVE',
      accessCount: 0,
      signature: tokenInfo.signature
    };

    this.accessTokens.set(tokenInfo.token, tokenRecord);
    this.accessTokens.set(tokenInfo.tokenId, tokenRecord);

    // Update Product Sales count
    product.salesCount += 1;
    product.updatedAt = new Date().toISOString();

    // Update or create Customer total spent
    let customer = this.customers.get(order.customerId);
    if (customer) {
      customer.totalSpent += order.amount;
      customer.ordersCount += 1;
    }

    // Record Transaction
    const txn: Transaction = {
      id: `TXN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      orderId: order.id,
      creatorId: order.creatorId,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      productId: order.productId,
      productName: order.productName,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: params.method || order.paymentMethod,
      provider: params.provider || order.paymentProvider,
      providerTransactionId: params.providerTxnId || `TXN-PROV-${Date.now()}`,
      status: 'SUCCESS',
      date: order.updatedAt
    };
    this.transactions.set(txn.id, txn);

    this.logAudit({
      action: 'PAYMENT_VERIFIED_AND_UNLOCKED',
      performedBy: 'payment_provider',
      ipAddress: '127.0.0.1',
      details: `Order ${order.id} verified. Access token generated for ${order.customerEmail}`
    });

    return { order, tokenRecord };
  }

  // --- Validate and Retrieve Unlocked Token ---
  public validateTokenAndGetContent(token: string): {
    valid: boolean;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'INVALID';
    record?: AccessTokenRecord;
    order?: Order;
    message?: string;
  } {
    const record = this.accessTokens.get(token);
    if (!record) {
      return { valid: false, status: 'INVALID', message: 'This access link is invalid or does not exist.' };
    }

    if (record.status === 'REVOKED') {
      return { valid: false, status: 'REVOKED', message: 'This access token has been revoked.' };
    }

    if (isAccessExpired(record.expiresAt)) {
      record.status = 'EXPIRED';
      return { valid: false, status: 'EXPIRED', message: 'Your access has expired.' };
    }

    record.accessCount += 1;
    record.lastAccessedAt = new Date().toISOString();

    const order = this.orders.get(record.orderId);

    return {
      valid: true,
      status: 'ACTIVE',
      record,
      order
    };
  }

  // --- Calculate Analytics ---
  public getAnalytics(creatorId?: string): AnalyticsStats {
    let ordersList = Array.from(this.orders.values());
    if (creatorId) {
      ordersList = ordersList.filter(o => o.creatorId === creatorId);
    }

    const successfulOrders = ordersList.filter(o => o.paymentStatus === 'SUCCESS');
    const pendingOrders = ordersList.filter(o => o.paymentStatus === 'PENDING');
    const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.amount, 0);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayOrders = successfulOrders.filter(o => o.createdAt.startsWith(todayStr));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);

    const uniqueCustomerIds = new Set(successfulOrders.map(o => o.customerId));

    // Revenue by last 7 days
    const revenueByDayMap: { [day: string]: { revenue: number; orders: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      revenueByDayMap[key] = { revenue: 0, orders: 0 };
    }

    successfulOrders.forEach(o => {
      const day = o.createdAt.slice(0, 10);
      if (revenueByDayMap[day]) {
        revenueByDayMap[day].revenue += o.amount;
        revenueByDayMap[day].orders += 1;
      }
    });

    const revenueByDay = Object.keys(revenueByDayMap).map(k => ({
      date: k,
      revenue: revenueByDayMap[k].revenue,
      orders: revenueByDayMap[k].orders
    }));

    const topProducts = Array.from(this.products.values()).map(p => ({
      id: p.id,
      name: p.name,
      sales: p.salesCount,
      revenue: p.salesCount * p.price
    })).sort((a, b) => b.revenue - a.revenue);

    const totalVisitors = 4820;
    const checkoutInitiated = 640;
    const conversionRate = Number(((successfulOrders.length / (checkoutInitiated || 1)) * 100).toFixed(1));

    return {
      totalRevenue,
      todayRevenue,
      successfulPayments: successfulOrders.length,
      pendingPayments: pendingOrders.length,
      refundsCount: this.refunds.size,
      refundsAmount: Array.from(this.refunds.values()).reduce((acc, r) => acc + (r.amount || 0), 0),
      totalCustomers: uniqueCustomerIds.size,
      conversionRate,
      visitorsCount: totalVisitors,
      checkoutInitiatedCount: checkoutInitiated,
      revenueByDay,
      topProducts
    };
  }
}

export const db = new DatabaseStore();
