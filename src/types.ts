export type ProductType =
  | 'protected_website'
  | 'digital_file'
  | 'video'
  | 'course'
  | 'pdf'
  | 'ebook'
  | 'membership'
  | 'telegram_community'
  | 'custom_url'
  | 'custom_content';

export type AccessDuration =
  | 'lifetime'
  | '1_day'
  | '7_days'
  | '30_days'
  | '90_days'
  | 'custom';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'CANCELLED';

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export type PaymentMethod = 'upi_qr' | 'upi_intent' | 'upi_collect' | 'card' | 'netbanking';

export type PaymentProviderType = 'simulator' | 'razorpay' | 'cashfree' | 'phonepe' | 'direct_upi';

export interface CreatorProfile {
  id: string;
  name: string;
  slug: string;
  email: string;
  avatar: string;
  bio: string;
  tagline: string;
  website?: string;
  verified: boolean;
  socialLinks?: {
    twitter?: string;
    youtube?: string;
    telegram?: string;
    instagram?: string;
    github?: string;
  };
  sellerConfig: {
    provider: PaymentProviderType;
    upiId: string;
    merchantName: string;
    accountHolderName?: string;
    bankName?: string;
    accountNumberMasked?: string;
    ifscCode?: string;
    gatewayKeyId?: string;
    gatewaySecretMasked?: string;
    webhookSecretMasked?: string;
  };
}

export interface Product {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  price: number;
  discountPrice?: number;
  currency: string; // "INR"
  category: string;
  productType: ProductType;
  // Destination is secret on public endpoints!
  destinationUrl?: string;
  customContent?: string;
  fileDetails?: {
    fileName: string;
    fileSize: string;
    mimeType: string;
    downloadCount: number;
  };
  accessDuration: AccessDuration;
  customDurationDays?: number;
  features: string[];
  isActive: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPageConfig {
  id: string;
  productId: string;
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundStyle: 'clean_white' | 'subtle_gray' | 'gradient_glow' | 'dark_minimal';
  buttonStyle: 'rounded_pill' | 'soft_corner' | 'sharp_modern';
  fontFamily: 'plus_jakarta' | 'system' | 'serif' | 'mono';
  layout: 'centered_card' | 'split_showcase' | 'editorial';
  showTestimonials: boolean;
  showFaq: boolean;
  showFeatures: boolean;
  showTerms: boolean;
  showRefundPolicy: boolean;
  customHeading?: string;
  customSubheading?: string;
  testimonials: Array<{
    name: string;
    role: string;
    avatar: string;
    comment: string;
    rating: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  termsText: string;
  refundPolicyText: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  totalSpent: number;
  ordersCount: number;
}

export interface Order {
  id: string; // e.g. EXP-2026-000001
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  creatorId: string;
  productId: string;
  productName: string;
  productCover: string;
  amount: number;
  originalPrice: number;
  discountAmount: number;
  couponCode?: string;
  currency: string;
  paymentId: string;
  paymentProvider: PaymentProviderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  accessTokenId?: string;
  accessToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  creatorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  provider: PaymentProviderType;
  providerTransactionId: string;
  status: PaymentStatus;
  refundStatus?: RefundStatus;
  refundAmount?: number;
  refundReason?: string;
  date: string;
}

export interface AccessTokenRecord {
  id: string;
  accessToken: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  productId: string;
  productName: string;
  productType: ProductType;
  destinationUrl: string;
  customContent?: string;
  fileDetails?: {
    fileName: string;
    fileSize: string;
    mimeType: string;
  };
  createdAt: string;
  expiresAt: string | null; // null for lifetime
  isLifetime: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  accessCount: number;
  lastAccessedAt?: string;
  signature: string;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  status: RefundStatus;
  reason?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  creatorId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  invoiceNumber: string;
  orderId: string;
  date: string;
  creator: {
    name: string;
    email: string;
    upiId: string;
    merchantName: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  product: {
    id: string;
    name: string;
    category: string;
    type: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    taxes: number; // GST 18% inclusive
    total: number;
    currency: string;
  };
  payment: {
    id: string;
    provider: string;
    method: string;
    status: string;
  };
}

export interface WebhookEventRecord {
  id: string;
  provider: PaymentProviderType;
  providerEventId: string;
  eventType: string;
  paymentId: string;
  orderId?: string;
  payload: any;
  signature: string;
  status: 'PROCESSED' | 'FAILED' | 'IGNORED';
  processedAt: string;
  error?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  ipAddress: string;
  details: string;
}

export interface AnalyticsStats {
  totalRevenue: number;
  todayRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  refundsCount: number;
  refundsAmount: number;
  totalCustomers: number;
  conversionRate: number;
  visitorsCount: number;
  checkoutInitiatedCount: number;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}
