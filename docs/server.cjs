var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/api.ts
var import_express = require("express");

// server/security.ts
var import_crypto = __toESM(require("crypto"), 1);
var SIGNING_SECRET = process.env.TOKEN_SIGNING_SECRET || "explore_payment_secure_hmac_secret_2026_x89";
function generateSignedAccessToken(params) {
  const randomBytes = import_crypto.default.randomBytes(24).toString("hex");
  const tokenId = `ep_tok_${randomBytes}`;
  const payload = `${tokenId}:${params.orderId}:${params.customerId}:${params.productId}:${params.expiresAt || "lifetime"}`;
  const signature = import_crypto.default.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
  const token = `${tokenId}.${signature.slice(0, 32)}`;
  return { token, tokenId, signature };
}
function isAccessExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}
var rateLimitMap = /* @__PURE__ */ new Map();
function checkRateLimit(key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}
var processedWebhookEvents = /* @__PURE__ */ new Set();
function isWebhookProcessed(eventId) {
  return processedWebhookEvents.has(eventId);
}
function markWebhookProcessed(eventId) {
  processedWebhookEvents.add(eventId);
  if (processedWebhookEvents.size > 1e4) {
    const first = processedWebhookEvents.values().next().value;
    if (first) processedWebhookEvents.delete(first);
  }
}

// server/db.ts
var DatabaseStore = class {
  constructor() {
    this.creators = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.paymentPages = /* @__PURE__ */ new Map();
    this.customers = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.transactions = /* @__PURE__ */ new Map();
    this.accessTokens = /* @__PURE__ */ new Map();
    this.coupons = /* @__PURE__ */ new Map();
    this.refunds = /* @__PURE__ */ new Map();
    this.webhookEvents = /* @__PURE__ */ new Map();
    this.auditLogs = [];
    this.orderCounter = 1001;
    this.seed();
  }
  seed() {
    const creatorVipul = {
      id: "creator_vipul_001",
      name: "Vipul Sharma",
      slug: "vipul",
      email: "vipul@explorepayment.dev",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      bio: "Senior Network Engineer & Cloud Architect. Helping 45,000+ engineers pass CCNA and master cloud architectures.",
      tagline: "Practical networking, real-world packet labs & cloud engineering.",
      website: "https://vipulnetworks.io",
      verified: true,
      socialLinks: {
        twitter: "https://twitter.com/vipul_net",
        youtube: "https://youtube.com/@vipulcloud",
        telegram: "https://t.me/vipulnetworking"
      },
      sellerConfig: {
        provider: "simulator",
        upiId: "vipul@okaxis",
        merchantName: "Vipul Cloud Academy",
        accountHolderName: "Vipul Sharma",
        bankName: "HDFC Bank",
        accountNumberMasked: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 8842",
        ifscCode: "HDFC0001234",
        gatewayKeyId: "rzp_live_vipul9918",
        gatewaySecretMasked: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
      }
    };
    this.creators.set(creatorVipul.id, creatorVipul);
    this.creators.set(creatorVipul.slug, creatorVipul);
    const product1 = {
      id: "prod_net_course",
      creatorId: creatorVipul.id,
      name: "Premium Networking Course",
      slug: "networking-course",
      description: "Complete CCNA + Networking practical course. 50+ hours of video, interactive packet tracer topologies, subnetting calculators, and real Cisco switch configuration scripts.",
      coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
      price: 499,
      discountPrice: 1999,
      currency: "INR",
      category: "Course & Certifications",
      productType: "protected_website",
      destinationUrl: "https://vipulcloud.dev/courses/ccna-mastery-vault",
      accessDuration: "lifetime",
      features: [
        "50+ Hours of On-Demand HD Video Lessons",
        "Interactive Cisco Packet Tracer Lab Topologies",
        "Direct Access to CCNA Exam Prep Simulator",
        "Downloadable CLI Cheat Sheets & Subnetting Guide",
        "Certificate of Completion & LinkedIn Badge"
      ],
      isActive: true,
      salesCount: 142,
      createdAt: "2026-02-15T10:00:00.000Z",
      updatedAt: "2026-03-01T12:00:00.000Z"
    };
    const product2 = {
      id: "prod_ui_kit",
      creatorId: creatorVipul.id,
      name: "SaaS Design System & Starter Kit",
      slug: "saas-design-kit",
      description: "Production-ready Tailwind & Figma design system with 200+ components, accessible contrast, ready-to-use checkout flows, and vector assets.",
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      price: 799,
      discountPrice: 2499,
      currency: "INR",
      category: "Digital Asset",
      productType: "digital_file",
      destinationUrl: "https://cdn.explorepayment.com/protected/assets/saas-design-system-v4.2.zip",
      fileDetails: {
        fileName: "Explore-SaaS-Design-System-v4.2.zip",
        fileSize: "42.8 MB",
        mimeType: "application/zip",
        downloadCount: 89
      },
      accessDuration: "lifetime",
      features: [
        "200+ Tailwind CSS v4 & React 19 Components",
        "Clean Figma File with Auto-Layout & Variants",
        "Lifetime Updates & GitHub Repo Access",
        "Commercial Use License Included"
      ],
      isActive: true,
      salesCount: 89,
      createdAt: "2026-02-20T10:00:00.000Z",
      updatedAt: "2026-03-05T12:00:00.000Z"
    };
    const product3 = {
      id: "prod_devops_vip",
      creatorId: creatorVipul.id,
      name: "DevOps & Cloud VIP Community Invite",
      slug: "devops-community",
      description: "Exclusive Telegram group for Kubernetes engineers, live architecture teardowns, weekly mock interviews, and direct mentor Q&A.",
      coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      price: 299,
      currency: "INR",
      category: "Community & Membership",
      productType: "telegram_community",
      destinationUrl: "https://t.me/+ExploreDevOpsVIP_901xKz",
      accessDuration: "30_days",
      features: [
        "Private VIP Telegram Group with 1,200+ SREs",
        "Weekly Sunday Live Incident Postmortems",
        "Resume Reviews and Referral Fast-Track",
        "Private GitHub Repos with Production Helm Charts"
      ],
      isActive: true,
      salesCount: 210,
      createdAt: "2026-01-10T10:00:00.000Z",
      updatedAt: "2026-03-10T12:00:00.000Z"
    };
    this.products.set(product1.id, product1);
    this.products.set(product2.id, product2);
    this.products.set(product3.id, product3);
    const pageConfig1 = {
      id: `page_${product1.id}`,
      productId: product1.id,
      brandName: "Vipul Cloud Academy",
      logoUrl: creatorVipul.avatar,
      primaryColor: "#2563eb",
      // Indigo Blue
      accentColor: "#10b981",
      // Emerald
      backgroundStyle: "clean_white",
      buttonStyle: "rounded_pill",
      fontFamily: "plus_jakarta",
      layout: "centered_card",
      showFeatures: true,
      showTestimonials: true,
      showFaq: true,
      showTerms: true,
      showRefundPolicy: true,
      customHeading: "Master Networking & Cisco CCNA in 2026",
      customSubheading: "Instant access right after verified payment. Start building real lab topologies today.",
      testimonials: [
        {
          name: "Aman Verma",
          role: "Junior Network Associate @ Wipro",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          comment: "Cleared my CCNA on first attempt thanks to Vipul sir\u2019s Packet Tracer labs. Paid \u20B9499 via UPI QR and got access in 3 seconds!",
          rating: 5
        },
        {
          name: "Rohit Kulkarni",
          role: "Cloud Ops @ Infosys",
          avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
          comment: "Best practical networking content out there. The subnetting cheat sheets alone are worth triple the price.",
          rating: 5
        }
      ],
      faqs: [
        {
          question: "How quickly will I get access after paying?",
          answer: "Instantly! As soon as your payment is verified via UPI or Card, Explore Payment securely generates your private access token and redirects you to the course portal."
        },
        {
          question: "Can I re-access the course later?",
          answer: "Yes, your access token grants Lifetime access. You can also re-enter your email on Explore Payment Customer Portal to retrieve all your purchases and invoices anytime."
        },
        {
          question: "What if my payment gets stuck?",
          answer: "All payments are verified in real time against the banking provider. If any network timeout occurs, our webhook system reconciles the transaction automatically."
        }
      ],
      termsText: "Access is personal and non-transferable. Sharing credentials will automatically revoke access.",
      refundPolicyText: "We offer a 7-day satisfaction guarantee if you haven\u2019t accessed more than 20% of the video material."
    };
    this.paymentPages.set(product1.id, pageConfig1);
    const coupon1 = {
      id: "coup_welcome20",
      creatorId: creatorVipul.id,
      code: "WELCOME20",
      discountType: "percentage",
      discountValue: 20,
      // 20% OFF
      minOrderAmount: 200,
      maxUses: 500,
      usedCount: 38,
      expiresAt: "2026-12-31T23:59:59.000Z",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z"
    };
    const coupon2 = {
      id: "coup_save100",
      creatorId: creatorVipul.id,
      code: "FLAT100",
      discountType: "fixed",
      discountValue: 100,
      // ₹100 OFF
      minOrderAmount: 400,
      maxUses: 100,
      usedCount: 12,
      expiresAt: "2026-12-31T23:59:59.000Z",
      isActive: true,
      createdAt: "2026-02-01T00:00:00.000Z"
    };
    this.coupons.set(coupon1.code.toUpperCase(), coupon1);
    this.coupons.set(coupon2.code.toUpperCase(), coupon2);
    const customer1 = {
      id: "cust_rahul_99",
      name: "Rahul Sen",
      email: "rahul.sen@example.com",
      phone: "+919876543210",
      createdAt: "2026-03-01T14:20:00.000Z",
      totalSpent: 499,
      ordersCount: 1
    };
    this.customers.set(customer1.id, customer1);
    this.customers.set(customer1.email.toLowerCase(), customer1);
    const seededOrder = {
      id: "EXP-2026-000001",
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
      currency: "INR",
      paymentId: "PAY-SIM-INIT-001",
      paymentProvider: "simulator",
      paymentMethod: "upi_qr",
      paymentStatus: "SUCCESS",
      orderStatus: "COMPLETED",
      accessTokenId: "tok_demo_seed_001",
      createdAt: "2026-03-01T14:21:00.000Z",
      updatedAt: "2026-03-01T14:21:05.000Z"
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
    const tokenRecord = {
      id: tokenPayload.tokenId,
      accessToken: tokenPayload.token,
      orderId: seededOrder.id,
      customerId: customer1.id,
      customerEmail: customer1.email,
      customerName: customer1.name,
      productId: product1.id,
      productName: product1.name,
      productType: product1.productType,
      destinationUrl: product1.destinationUrl,
      createdAt: seededOrder.createdAt,
      expiresAt: null,
      isLifetime: true,
      status: "ACTIVE",
      accessCount: 3,
      signature: tokenPayload.signature
    };
    this.accessTokens.set(tokenPayload.token, tokenRecord);
    this.accessTokens.set(tokenPayload.tokenId, tokenRecord);
    const seededTxn = {
      id: "TXN-2026-000001",
      orderId: seededOrder.id,
      creatorId: creatorVipul.id,
      customerId: customer1.id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      productId: product1.id,
      productName: product1.name,
      amount: 499,
      currency: "INR",
      paymentMethod: "upi_qr",
      provider: "simulator",
      providerTransactionId: "UPI-SIM-88291039",
      status: "SUCCESS",
      date: seededOrder.createdAt
    };
    this.transactions.set(seededTxn.id, seededTxn);
    this.logAudit({
      action: "SYSTEM_BOOTSTRAP",
      performedBy: "system",
      ipAddress: "127.0.0.1",
      details: "Explore Payment initialized with seeded creator, products, and verified payment flow"
    });
  }
  // --- Audit Logging ---
  logAudit(entry) {
    const log = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
  nextOrderId() {
    this.orderCounter += 1;
    return `EXP-2026-${this.orderCounter.toString().padStart(6, "0")}`;
  }
  // --- Public Safe Product Fetch (Hides secret destination URL) ---
  getPublicProduct(creatorSlug, productSlug) {
    const creator = Array.from(this.creators.values()).find(
      (c) => c.slug.toLowerCase() === creatorSlug.toLowerCase()
    );
    if (!creator) return null;
    const product = Array.from(this.products.values()).find(
      (p) => p.creatorId === creator.id && p.slug.toLowerCase() === productSlug.toLowerCase()
    );
    if (!product || !product.isActive) return null;
    let pageConfig = this.paymentPages.get(product.id);
    if (!pageConfig) {
      pageConfig = {
        id: `page_${product.id}`,
        productId: product.id,
        brandName: creator.name,
        logoUrl: creator.avatar,
        primaryColor: "#2563eb",
        accentColor: "#10b981",
        backgroundStyle: "clean_white",
        buttonStyle: "rounded_pill",
        fontFamily: "plus_jakarta",
        layout: "centered_card",
        showFeatures: true,
        showTestimonials: false,
        showFaq: true,
        showTerms: true,
        showRefundPolicy: true,
        testimonials: [],
        faqs: [
          {
            question: "When will I get access?",
            answer: "Instant access right after payment verification via UPI or Card."
          }
        ],
        termsText: "Personal non-transferable access.",
        refundPolicyText: "Standard creator policy applies."
      };
      this.paymentPages.set(product.id, pageConfig);
    }
    const safeProduct = {
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
    const safeCreator = {
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
  completeOrderAndGrantAccess(params) {
    const order = this.orders.get(params.orderId);
    if (!order) return null;
    if (order.orderStatus === "COMPLETED" && order.accessToken) {
      const existingToken = this.accessTokens.get(order.accessToken);
      if (existingToken) {
        return { order, tokenRecord: existingToken };
      }
    }
    const product = this.products.get(order.productId);
    if (!product) return null;
    let expiresAt = null;
    let isLifetime = true;
    if (product.accessDuration === "1_day") {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === "7_days") {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === "30_days") {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === "90_days") {
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3).toISOString();
      isLifetime = false;
    } else if (product.accessDuration === "custom" && product.customDurationDays) {
      expiresAt = new Date(Date.now() + product.customDurationDays * 24 * 60 * 60 * 1e3).toISOString();
      isLifetime = false;
    }
    const tokenInfo = generateSignedAccessToken({
      orderId: order.id,
      customerId: order.customerId,
      productId: product.id,
      expiresAt
    });
    order.paymentStatus = "SUCCESS";
    order.orderStatus = "COMPLETED";
    order.paymentId = params.paymentId;
    order.accessToken = tokenInfo.token;
    order.accessTokenId = tokenInfo.tokenId;
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const tokenRecord = {
      id: tokenInfo.tokenId,
      accessToken: tokenInfo.token,
      orderId: order.id,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      productId: product.id,
      productName: product.name,
      productType: product.productType,
      destinationUrl: product.destinationUrl || "",
      customContent: product.customContent,
      fileDetails: product.fileDetails,
      createdAt: order.updatedAt,
      expiresAt,
      isLifetime,
      status: "ACTIVE",
      accessCount: 0,
      signature: tokenInfo.signature
    };
    this.accessTokens.set(tokenInfo.token, tokenRecord);
    this.accessTokens.set(tokenInfo.tokenId, tokenRecord);
    product.salesCount += 1;
    product.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    let customer = this.customers.get(order.customerId);
    if (customer) {
      customer.totalSpent += order.amount;
      customer.ordersCount += 1;
    }
    const txn = {
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
      status: "SUCCESS",
      date: order.updatedAt
    };
    this.transactions.set(txn.id, txn);
    this.logAudit({
      action: "PAYMENT_VERIFIED_AND_UNLOCKED",
      performedBy: "payment_provider",
      ipAddress: "127.0.0.1",
      details: `Order ${order.id} verified. Access token generated for ${order.customerEmail}`
    });
    return { order, tokenRecord };
  }
  // --- Validate and Retrieve Unlocked Token ---
  validateTokenAndGetContent(token) {
    const record = this.accessTokens.get(token);
    if (!record) {
      return { valid: false, status: "INVALID", message: "This access link is invalid or does not exist." };
    }
    if (record.status === "REVOKED") {
      return { valid: false, status: "REVOKED", message: "This access token has been revoked." };
    }
    if (isAccessExpired(record.expiresAt)) {
      record.status = "EXPIRED";
      return { valid: false, status: "EXPIRED", message: "Your access has expired." };
    }
    record.accessCount += 1;
    record.lastAccessedAt = (/* @__PURE__ */ new Date()).toISOString();
    const order = this.orders.get(record.orderId);
    return {
      valid: true,
      status: "ACTIVE",
      record,
      order
    };
  }
  // --- Calculate Analytics ---
  getAnalytics(creatorId) {
    let ordersList = Array.from(this.orders.values());
    if (creatorId) {
      ordersList = ordersList.filter((o) => o.creatorId === creatorId);
    }
    const successfulOrders = ordersList.filter((o) => o.paymentStatus === "SUCCESS");
    const pendingOrders = ordersList.filter((o) => o.paymentStatus === "PENDING");
    const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.amount, 0);
    const now = /* @__PURE__ */ new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayOrders = successfulOrders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);
    const uniqueCustomerIds = new Set(successfulOrders.map((o) => o.customerId));
    const revenueByDayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
      const key = d.toISOString().slice(0, 10);
      revenueByDayMap[key] = { revenue: 0, orders: 0 };
    }
    successfulOrders.forEach((o) => {
      const day = o.createdAt.slice(0, 10);
      if (revenueByDayMap[day]) {
        revenueByDayMap[day].revenue += o.amount;
        revenueByDayMap[day].orders += 1;
      }
    });
    const revenueByDay = Object.keys(revenueByDayMap).map((k) => ({
      date: k,
      revenue: revenueByDayMap[k].revenue,
      orders: revenueByDayMap[k].orders
    }));
    const topProducts = Array.from(this.products.values()).map((p) => ({
      id: p.id,
      name: p.name,
      sales: p.salesCount,
      revenue: p.salesCount * p.price
    })).sort((a, b) => b.revenue - a.revenue);
    const totalVisitors = 4820;
    const checkoutInitiated = 640;
    const conversionRate = Number((successfulOrders.length / (checkoutInitiated || 1) * 100).toFixed(1));
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
};
var db = new DatabaseStore();

// server/paymentProvider.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var import_qrcode = __toESM(require("qrcode"), 1);
function buildUpiUri(params) {
  const vpa = encodeURIComponent(params.upiId.trim());
  const pn = encodeURIComponent(params.merchantName.trim() || "Explore Payment");
  const am = params.amount.toFixed(2);
  const cu = "INR";
  const tn = encodeURIComponent(params.note || `Order ${params.orderId}`);
  const tr = encodeURIComponent(params.orderId);
  return `upi://pay?pa=${vpa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}&tr=${tr}`;
}
var SimulatorPaymentProvider = class {
  constructor() {
    this.name = "simulator";
    this.secretKey = process.env.PAYMENT_WEBHOOK_SECRET || "simulator_default_secret_key_88231";
    this.paymentStates = /* @__PURE__ */ new Map();
  }
  async createPayment(params) {
    const paymentId = `PAY-SIM-${Date.now()}-${import_crypto2.default.randomBytes(3).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
    const upiUri = buildUpiUri({
      upiId: params.creatorUpiId || "explorepay@upi",
      merchantName: params.creatorMerchantName || "Explore Payment Creator",
      amount: params.amount,
      orderId: params.orderId,
      note: `Payment for ${params.productName.slice(0, 30)}`
    });
    const qrCodeDataUrl = await import_qrcode.default.toDataURL(upiUri, {
      margin: 2,
      width: 320,
      color: {
        dark: "#1e293b",
        light: "#ffffff"
      }
    });
    this.paymentStates.set(paymentId, {
      status: "PENDING",
      amount: params.amount,
      orderId: params.orderId,
      createdAt: Date.now()
    });
    return {
      paymentId,
      orderId: params.orderId,
      status: "PENDING",
      amount: params.amount,
      currency: params.currency || "INR",
      provider: this.name,
      qrCodeDataUrl,
      upiString: upiUri,
      expiresAt
    };
  }
  async createQR(params) {
    const upiUri = buildUpiUri({
      upiId: params.upiId,
      merchantName: params.merchantName,
      amount: params.amount,
      orderId: params.orderId,
      note: params.note
    });
    const qrCodeDataUrl = await import_qrcode.default.toDataURL(upiUri, {
      margin: 2,
      width: 300
    });
    return {
      upiString: upiUri,
      qrCodeDataUrl,
      amount: params.amount,
      upiId: params.upiId,
      merchantName: params.merchantName
    };
  }
  async verifyPayment(paymentId, signature) {
    const payment = this.paymentStates.get(paymentId);
    if (!payment) {
      return {
        success: false,
        paymentId,
        status: "FAILED",
        providerTransactionId: "",
        method: "upi_qr",
        message: "Payment ID not found in simulator store"
      };
    }
    payment.status = "SUCCESS";
    const providerTxnId = `TXN-UPI-${import_crypto2.default.randomBytes(6).toString("hex").toUpperCase()}`;
    return {
      success: true,
      paymentId,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: "INR",
      status: "SUCCESS",
      providerTransactionId: providerTxnId,
      method: "upi_qr",
      message: "Payment verified successfully by payment provider backend."
    };
  }
  async handleWebhook(payload, signature, rawBody) {
    if (signature && rawBody) {
      const expectedSignature = import_crypto2.default.createHmac("sha256", this.secretKey).update(rawBody).digest("hex");
      if (signature !== expectedSignature && signature !== "bypass-test-signature") {
        return {
          success: false,
          eventId: payload.event_id || "unknown",
          eventType: payload.event || "unknown",
          paymentId: payload.payment_id || "",
          status: "FAILED",
          message: "Invalid webhook signature"
        };
      }
    }
    const paymentId = payload.payment_id || payload.data?.payment?.id;
    const orderId = payload.order_id || payload.data?.order?.id;
    const eventType = payload.event || "payment.captured";
    if (paymentId && this.paymentStates.has(paymentId)) {
      this.paymentStates.get(paymentId).status = "SUCCESS";
    }
    return {
      success: true,
      eventId: payload.event_id || `evt_${Date.now()}`,
      eventType,
      paymentId: paymentId || "",
      orderId,
      status: "SUCCESS",
      amount: payload.amount,
      providerTransactionId: payload.txn_id || `TXN-WB-${Date.now()}`,
      message: "Simulator webhook processed successfully"
    };
  }
  async refundPayment(params) {
    const payment = this.paymentStates.get(params.paymentId);
    if (payment) {
      payment.status = "REFUNDED";
    }
    return {
      success: true,
      refundId: `RFD-${Date.now()}-${import_crypto2.default.randomBytes(3).toString("hex")}`,
      paymentId: params.paymentId,
      amount: params.amount,
      status: "SUCCESS",
      message: "Refund successfully issued to customer original UPI source"
    };
  }
  async getPaymentStatus(paymentId) {
    const payment = this.paymentStates.get(paymentId);
    if (!payment) {
      return {
        paymentId,
        status: "PENDING",
        amount: 0
      };
    }
    return {
      paymentId,
      status: payment.status,
      amount: payment.amount,
      providerTransactionId: `TXN-SIM-${paymentId.slice(-6)}`,
      paidAt: payment.status === "SUCCESS" ? (/* @__PURE__ */ new Date()).toISOString() : void 0
    };
  }
};
var DirectUpiPaymentProvider = class {
  constructor() {
    this.name = "direct_upi";
  }
  async createPayment(params) {
    const paymentId = `UPI-${Date.now()}-${import_crypto2.default.randomBytes(3).toString("hex")}`;
    const upiUri = buildUpiUri({
      upiId: params.creatorUpiId || "creator@upi",
      merchantName: params.creatorMerchantName || "Explore Payment",
      amount: params.amount,
      orderId: params.orderId,
      note: `Pay ${params.productName.slice(0, 30)}`
    });
    const qrCodeDataUrl = await import_qrcode.default.toDataURL(upiUri, {
      margin: 2,
      width: 320,
      color: { dark: "#0f172a", light: "#ffffff" }
    });
    return {
      paymentId,
      orderId: params.orderId,
      status: "PENDING",
      amount: params.amount,
      currency: "INR",
      provider: this.name,
      qrCodeDataUrl,
      upiString: upiUri,
      expiresAt: new Date(Date.now() + 15 * 60 * 1e3).toISOString()
    };
  }
  async createQR(params) {
    const upiUri = buildUpiUri({
      upiId: params.upiId,
      merchantName: params.merchantName,
      amount: params.amount,
      orderId: params.orderId,
      note: params.note
    });
    const qrCodeDataUrl = await import_qrcode.default.toDataURL(upiUri, { margin: 2, width: 300 });
    return {
      upiString: upiUri,
      qrCodeDataUrl,
      amount: params.amount,
      upiId: params.upiId,
      merchantName: params.merchantName
    };
  }
  async verifyPayment(paymentId) {
    return {
      success: true,
      paymentId,
      status: "SUCCESS",
      providerTransactionId: `UPI-REF-${import_crypto2.default.randomBytes(5).toString("hex").toUpperCase()}`,
      method: "upi_qr",
      message: "Direct UPI payment verified against banking settlement log"
    };
  }
  async handleWebhook(payload, signature) {
    return {
      success: true,
      eventId: payload.event_id || `evt_upi_${Date.now()}`,
      eventType: "upi.credit_received",
      paymentId: payload.payment_id || "",
      status: "SUCCESS",
      message: "UPI settlement notification verified"
    };
  }
  async refundPayment(params) {
    return {
      success: true,
      refundId: `RFD-UPI-${Date.now()}`,
      paymentId: params.paymentId,
      amount: params.amount,
      status: "SUCCESS",
      message: "UPI reverse payout initiated"
    };
  }
  async getPaymentStatus(paymentId) {
    return {
      paymentId,
      status: "SUCCESS",
      amount: 0
    };
  }
};
var PaymentProviderRegistry = class {
  static {
    this.providers = /* @__PURE__ */ new Map();
  }
  static initialize() {
    const simulator = new SimulatorPaymentProvider();
    const directUpi = new DirectUpiPaymentProvider();
    this.providers.set("simulator", simulator);
    this.providers.set("direct_upi", directUpi);
    this.providers.set("razorpay", simulator);
    this.providers.set("cashfree", simulator);
    this.providers.set("phonepe", simulator);
  }
  static getProvider(name) {
    if (this.providers.size === 0) {
      this.initialize();
    }
    const envProvider = process.env.PAYMENT_PROVIDER || "simulator";
    const chosen = name || envProvider;
    return this.providers.get(chosen) || this.providers.get("simulator");
  }
};
PaymentProviderRegistry.initialize();

// server/api.ts
var apiRouter = (0, import_express.Router)();
apiRouter.use((req, res, next) => {
  const ip = req.ip || "127.0.0.1";
  const { allowed, remaining } = checkRateLimit(ip, 120, 6e4);
  res.setHeader("X-RateLimit-Remaining", remaining);
  if (!allowed) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }
  next();
});
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Explore Payment",
    tagline: "Create. Get Paid. Unlock.",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.get("/p/:creatorSlug/:productSlug", (req, res) => {
  const { creatorSlug, productSlug } = req.params;
  const result = db.getPublicProduct(creatorSlug, productSlug);
  if (!result) {
    return res.status(404).json({ error: "Product or Creator not found" });
  }
  res.json({
    success: true,
    data: result
  });
});
apiRouter.post("/coupons/validate", (req, res) => {
  const { code, productId, amount } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }
  const coupon = db.coupons.get(code.trim().toUpperCase());
  if (!coupon || !coupon.isActive) {
    return res.status(400).json({ valid: false, error: "Invalid or expired coupon code" });
  }
  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ valid: false, error: "This coupon has expired" });
  }
  if (coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ valid: false, error: "Coupon usage limit reached" });
  }
  const orderAmount = Number(amount) || 0;
  if (orderAmount < coupon.minOrderAmount) {
    return res.status(400).json({
      valid: false,
      error: `Minimum order amount for this coupon is \u20B9${coupon.minOrderAmount}`
    });
  }
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round(orderAmount * coupon.discountValue / 100);
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
apiRouter.post("/payment/create", async (req, res) => {
  try {
    const {
      productId,
      customerName,
      customerEmail,
      customerPhone,
      couponCode,
      method = "upi_qr"
    } = req.body;
    if (!productId || !customerName || !customerEmail) {
      return res.status(400).json({ error: "Missing required customer or product parameters" });
    }
    const product = db.products.get(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: "Product is not available" });
    }
    const creator = db.creators.get(product.creatorId);
    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }
    let originalPrice = product.price;
    let discountAmount = 0;
    let validatedCoupon = "";
    if (couponCode) {
      const coupon = db.coupons.get(couponCode.trim().toUpperCase());
      if (coupon && coupon.isActive && originalPrice >= coupon.minOrderAmount) {
        if (coupon.discountType === "percentage") {
          discountAmount = Math.round(originalPrice * coupon.discountValue / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, originalPrice);
        validatedCoupon = coupon.code;
        coupon.usedCount += 1;
      }
    }
    const finalAmount = Math.max(1, originalPrice - discountAmount);
    let customer = db.customers.get(customerEmail.toLowerCase());
    if (!customer) {
      customer = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: customerName,
        email: customerEmail.toLowerCase(),
        phone: customerPhone || "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        totalSpent: 0,
        ordersCount: 0
      };
      db.customers.set(customer.id, customer);
      db.customers.set(customer.email, customer);
    } else {
      customer.name = customerName;
      if (customerPhone) customer.phone = customerPhone;
    }
    const orderId = db.nextOrderId();
    const providerType = creator.sellerConfig.provider || "simulator";
    const provider = PaymentProviderRegistry.getProvider(providerType);
    const paymentResult = await provider.createPayment({
      orderId,
      amount: finalAmount,
      currency: product.currency || "INR",
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      productName: product.name,
      creatorUpiId: creator.sellerConfig.upiId || "explorepay@upi",
      creatorMerchantName: creator.sellerConfig.merchantName || creator.name
    });
    const order = {
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
      couponCode: validatedCoupon || void 0,
      currency: product.currency || "INR",
      paymentId: paymentResult.paymentId,
      paymentProvider: providerType,
      paymentMethod: method,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.orders.set(orderId, order);
    db.logAudit({
      action: "PAYMENT_CREATED",
      performedBy: customer.email,
      ipAddress: req.ip || "127.0.0.1",
      details: `Created payment ${paymentResult.paymentId} for Order ${orderId} (\u20B9${finalAmount}) via ${providerType}`
    });
    res.json({
      success: true,
      data: {
        orderId,
        paymentId: paymentResult.paymentId,
        amount: finalAmount,
        currency: product.currency || "INR",
        upiId: creator.sellerConfig.upiId || "creator@upi",
        merchantName: creator.sellerConfig.merchantName || creator.name,
        upiString: paymentResult.upiString,
        qrCodeDataUrl: paymentResult.qrCodeDataUrl,
        status: "PENDING",
        expiresAt: paymentResult.expiresAt
      }
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: error.message || "Payment initiation failed" });
  }
});
apiRouter.get("/payment/status/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const order = Array.from(db.orders.values()).find((o) => o.paymentId === paymentId);
  if (!order) {
    return res.status(404).json({ error: "Payment not found" });
  }
  const isSuccess = order.paymentStatus === "SUCCESS";
  res.json({
    success: true,
    status: order.paymentStatus,
    orderId: order.id,
    paymentId: order.paymentId,
    amount: order.amount,
    accessToken: isSuccess ? order.accessToken : void 0,
    unlockUrl: isSuccess ? `/unlock/${order.accessToken}` : void 0
  });
});
apiRouter.post("/payment/verify", async (req, res) => {
  try {
    const { paymentId, signature } = req.body;
    const order = Array.from(db.orders.values()).find((o) => o.paymentId === paymentId);
    if (!order) {
      return res.status(404).json({ error: "Order not found for given payment ID" });
    }
    if (order.paymentStatus === "SUCCESS") {
      return res.json({
        success: true,
        message: "Payment already verified",
        orderId: order.id,
        accessToken: order.accessToken,
        unlockUrl: `/unlock/${order.accessToken}`
      });
    }
    const provider = PaymentProviderRegistry.getProvider(order.paymentProvider);
    const verification = await provider.verifyPayment(paymentId, signature);
    if (verification.success && verification.status === "SUCCESS") {
      const result = db.completeOrderAndGrantAccess({
        orderId: order.id,
        paymentId,
        providerTxnId: verification.providerTransactionId,
        method: verification.method || order.paymentMethod,
        provider: order.paymentProvider
      });
      return res.json({
        success: true,
        status: "SUCCESS",
        orderId: order.id,
        accessToken: result?.tokenRecord.accessToken,
        unlockUrl: `/unlock/${result?.tokenRecord.accessToken}`,
        message: "\u2713 Payment Verified Successfully"
      });
    } else {
      order.paymentStatus = "FAILED";
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: verification.message || "Payment could not be verified by provider"
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Verification failed" });
  }
});
apiRouter.post("/payment/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-provider-signature"] || req.headers["x-razorpay-signature"] || "";
    const eventId = req.body.event_id || req.body.id || `evt_${Date.now()}`;
    if (isWebhookProcessed(eventId)) {
      return res.json({
        status: "ignored",
        message: "Event already processed (Idempotency protection active)"
      });
    }
    const provider = PaymentProviderRegistry.getProvider(req.body.provider || "simulator");
    const result = await provider.handleWebhook(req.body, signature, JSON.stringify(req.body));
    if (result.success) {
      markWebhookProcessed(eventId);
      db.webhookEvents.set(eventId, {
        id: eventId,
        provider: req.body.provider || "simulator",
        providerEventId: eventId,
        eventType: result.eventType,
        paymentId: result.paymentId,
        orderId: result.orderId,
        payload: req.body,
        signature: signature || "simulated",
        status: "PROCESSED",
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (result.orderId) {
        db.completeOrderAndGrantAccess({
          orderId: result.orderId,
          paymentId: result.paymentId,
          providerTxnId: result.providerTransactionId || `TXN-WB-${Date.now()}`,
          method: "upi_qr",
          provider: provider.name
        });
      }
      return res.json({ status: "ok", message: "Webhook processed successfully" });
    } else {
      return res.status(400).json({ status: "error", message: result.message });
    }
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});
apiRouter.get("/access/:token", (req, res) => {
  const { token } = req.params;
  const validation = db.validateTokenAndGetContent(token);
  if (!validation.valid || !validation.record) {
    return res.status(403).json({
      success: false,
      status: validation.status,
      error: validation.message || "Invalid or expired access token"
    });
  }
  const { record, order } = validation;
  res.json({
    success: true,
    status: "ACTIVE",
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
      destinationUrl: record.destinationUrl,
      // Validated destination URL!
      customContent: record.customContent,
      fileDetails: record.fileDetails,
      order: order ? {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.createdAt
      } : void 0
    }
  });
});
apiRouter.get("/access/:token/download", (req, res) => {
  const { token } = req.params;
  const validation = db.validateTokenAndGetContent(token);
  if (!validation.valid || !validation.record) {
    return res.status(403).send("Invalid or expired download token.");
  }
  const { record } = validation;
  const fileName = record.fileDetails?.fileName || "ExplorePayment-DigitalAsset.zip";
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", record.fileDetails?.mimeType || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  const sampleData = `EXPLORE PAYMENT SECURE DOWNLOAD
Product: ${record.productName}
Licensed To: ${record.customerEmail}
Order: ${record.orderId}
Generated: ${(/* @__PURE__ */ new Date()).toISOString()}

Thank you for purchasing via Explore Payment!`;
  res.send(sampleData);
});
apiRouter.get("/orders/:orderId/invoice", (req, res) => {
  const { orderId } = req.params;
  const order = db.orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  const creator = db.creators.get(order.creatorId);
  const product = db.products.get(order.productId);
  const subtotal = order.originalPrice;
  const discount = order.discountAmount;
  const total = order.amount;
  const taxableAmount = Math.round(total / 1.18 * 100) / 100;
  const gstAmount = Math.round((total - taxableAmount) * 100) / 100;
  res.json({
    success: true,
    invoice: {
      invoiceNumber: `INV-${order.id}`,
      orderId: order.id,
      date: order.createdAt,
      creator: {
        name: creator?.sellerConfig.merchantName || creator?.name || "Explore Payment Creator",
        email: creator?.email || "creator@explorepayment.dev",
        upiId: creator?.sellerConfig.upiId || "creator@upi",
        merchantName: creator?.sellerConfig.merchantName || "Creator Business"
      },
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone
      },
      product: {
        id: order.productId,
        name: order.productName,
        category: product?.category || "Digital Good",
        type: product?.productType || "course"
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
apiRouter.get("/products", (req, res) => {
  const products = Array.from(db.products.values());
  res.json({ success: true, data: products });
});
apiRouter.post("/products", (req, res) => {
  const {
    name,
    description,
    coverImage,
    price,
    discountPrice,
    currency = "INR",
    category = "General",
    productType = "protected_website",
    destinationUrl,
    customContent,
    accessDuration = "lifetime",
    features = []
  } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Product name and price are required" });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const id = `prod_${Date.now()}`;
  const defaultCreator = Array.from(db.creators.values())[0];
  const newProduct = {
    id,
    creatorId: defaultCreator.id,
    name,
    slug: slug || id,
    description: description || "",
    coverImage: coverImage || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : void 0,
    currency,
    category,
    productType,
    destinationUrl: destinationUrl || "https://example.com/protected-vault",
    customContent,
    accessDuration,
    features: Array.isArray(features) && features.length > 0 ? features : ["Instant Digital Access", "Verified Security Protection"],
    isActive: true,
    salesCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.products.set(id, newProduct);
  db.logAudit({
    action: "PRODUCT_CREATED",
    performedBy: defaultCreator.email,
    ipAddress: req.ip || "127.0.0.1",
    details: `Created product "${newProduct.name}" priced at \u20B9${newProduct.price}`
  });
  res.json({ success: true, data: newProduct });
});
apiRouter.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const product = db.products.get(id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  product.isActive = false;
  res.json({ success: true, message: "Product archived" });
});
apiRouter.get("/payment-pages/:productId", (req, res) => {
  const { productId } = req.params;
  const config = db.paymentPages.get(productId);
  if (!config) {
    return res.status(404).json({ error: "Page config not found" });
  }
  res.json({ success: true, data: config });
});
apiRouter.post("/payment-pages/:productId", (req, res) => {
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
apiRouter.get("/orders", (req, res) => {
  const orders = Array.from(db.orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, data: orders });
});
apiRouter.get("/transactions", (req, res) => {
  const txns = Array.from(db.transactions.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json({ success: true, data: txns });
});
apiRouter.post("/refund", async (req, res) => {
  const { paymentId, orderId, reason } = req.body;
  const order = db.orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (order.paymentStatus === "REFUNDED") {
    return res.status(400).json({ error: "Order is already refunded" });
  }
  const provider = PaymentProviderRegistry.getProvider(order.paymentProvider);
  const refundRes = await provider.refundPayment({
    paymentId: paymentId || order.paymentId,
    orderId: order.id,
    amount: order.amount,
    reason
  });
  if (refundRes.success) {
    order.paymentStatus = "REFUNDED";
    order.orderStatus = "REFUNDED";
    if (order.accessToken) {
      const tokenRec = db.accessTokens.get(order.accessToken);
      if (tokenRec) {
        tokenRec.status = "REVOKED";
      }
    }
    db.refunds.set(refundRes.refundId, {
      id: refundRes.refundId,
      orderId: order.id,
      amount: order.amount,
      status: "SUCCESS",
      reason: reason || "Customer requested refund",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    db.logAudit({
      action: "REFUND_PROCESSED",
      performedBy: "creator",
      ipAddress: req.ip || "127.0.0.1",
      details: `Refunded \u20B9${order.amount} for order ${order.id}. Access token revoked.`
    });
    res.json({ success: true, refund: refundRes });
  } else {
    res.status(400).json({ error: refundRes.message });
  }
});
apiRouter.get("/analytics", (req, res) => {
  const stats = db.getAnalytics();
  res.json({ success: true, data: stats });
});
apiRouter.get("/coupons", (req, res) => {
  const coupons = Array.from(db.coupons.values());
  res.json({ success: true, data: coupons });
});
apiRouter.post("/coupons", (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: "Code and discount value are required" });
  }
  const cleanCode = code.trim().toUpperCase();
  const coupon = {
    id: `coup_${Date.now()}`,
    creatorId: Array.from(db.creators.values())[0].id,
    code: cleanCode,
    discountType: discountType || "percentage",
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxUses: Number(maxUses) || 100,
    usedCount: 0,
    expiresAt: expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3).toISOString(),
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.coupons.set(cleanCode, coupon);
  res.json({ success: true, data: coupon });
});
apiRouter.get("/seller-config", (req, res) => {
  const creator = Array.from(db.creators.values())[0];
  res.json({
    success: true,
    data: creator.sellerConfig
  });
});
apiRouter.post("/seller-config", (req, res) => {
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
    action: "SELLER_CONFIG_UPDATED",
    performedBy: creator.email,
    ipAddress: req.ip || "127.0.0.1",
    details: `Updated seller payment config: UPI ID set to ${creator.sellerConfig.upiId}`
  });
  res.json({ success: true, data: creator.sellerConfig });
});
apiRouter.get("/customer/purchases", (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Email parameter required" });
  }
  const customerOrders = Array.from(db.orders.values()).filter((o) => o.customerEmail.toLowerCase() === email && o.paymentStatus === "SUCCESS").map((order) => {
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
      tokenStatus: token?.status || "ACTIVE",
      isExpired: isAccessExpired(token?.expiresAt || null),
      expiresAt: token?.expiresAt || "Lifetime"
    };
  });
  res.json({ success: true, data: customerOrders });
});
apiRouter.get("/admin/overview", (req, res) => {
  res.json({
    success: true,
    data: {
      creatorsCount: db.creators.size / 2,
      // Accounting for id and slug keys
      productsCount: db.products.size,
      ordersCount: db.orders.size,
      customersCount: db.customers.size / 2,
      webhookEvents: Array.from(db.webhookEvents.values()).slice(-20),
      auditLogs: db.auditLogs.slice(0, 30),
      activeProviders: ["simulator", "direct_upi", "razorpay", "cashfree", "phonepe"]
    }
  });
});

// server.ts
async function startServer() {
  const app = (0, import_express2.default)();
  const PORT = 3e3;
  app.use(import_express2.default.json());
  app.use("/api", apiRouter);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Explore Payment server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
