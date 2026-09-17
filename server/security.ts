import crypto from 'crypto';

const SIGNING_SECRET = process.env.TOKEN_SIGNING_SECRET || 'explore_payment_secure_hmac_secret_2026_x89';

export interface TokenPayload {
  tokenId: string;
  orderId: string;
  customerId: string;
  productId: string;
  expiresAt: string | null;
}

/**
 * Generate cryptographically secure random token string with signature
 */
export function generateSignedAccessToken(params: {
  orderId: string;
  customerId: string;
  productId: string;
  expiresAt: string | null;
}): { token: string; tokenId: string; signature: string } {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const tokenId = `ep_tok_${randomBytes}`;

  const payload = `${tokenId}:${params.orderId}:${params.customerId}:${params.productId}:${params.expiresAt || 'lifetime'}`;
  const signature = crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');

  // Format: tokenId.signature
  const token = `${tokenId}.${signature.slice(0, 32)}`;

  return { token, tokenId, signature };
}

/**
 * Verify token format and cryptographic signature
 */
export function verifyAccessTokenSignature(
  token: string,
  meta: {
    tokenId: string;
    orderId: string;
    customerId: string;
    productId: string;
    expiresAt: string | null;
  }
): boolean {
  if (!token || !token.includes('.')) return false;

  const [tokenId, sigPart] = token.split('.');
  if (tokenId !== meta.tokenId) return false;

  const payload = `${tokenId}:${meta.orderId}:${meta.customerId}:${meta.productId}:${meta.expiresAt || 'lifetime'}`;
  const expectedSignature = crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');

  return sigPart === expectedSignature.slice(0, 32);
}

/**
 * Check if an access expiration date has passed
 */
export function isAccessExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false; // Lifetime access
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * In-memory sliding window rate limiter
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, limit = 60, windowMs = 60000): { allowed: boolean; remaining: number } {
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

/**
 * Webhook Idempotency Registry
 * Tracks processed event IDs to guarantee events are processed exactly once
 */
const processedWebhookEvents = new Set<string>();

export function isWebhookProcessed(eventId: string): boolean {
  return processedWebhookEvents.has(eventId);
}

export function markWebhookProcessed(eventId: string): void {
  processedWebhookEvents.add(eventId);
  // Optional cleanup if set grows too large
  if (processedWebhookEvents.size > 10000) {
    const first = processedWebhookEvents.values().next().value;
    if (first) processedWebhookEvents.delete(first);
  }
}
