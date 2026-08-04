/**
 * Rate Limiting — token bucket em memória.
 * Em produção multi-instância, troque por armazenamento distribuído
 * (Upstash Redis / PostgreSQL) sem alterar a API pública.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInMs: number;
  limit: number;
}

export function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) buckets.clear();

  let bucket = buckets.get(key);
  if (!bucket || now - bucket.lastRefill >= windowMs) {
    bucket = { tokens: limit, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsed = (now - bucket.lastRefill) / windowMs;
  bucket.tokens = Math.min(limit, bucket.tokens + elapsed * limit);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      success: true,
      remaining: Math.floor(bucket.tokens),
      resetInMs: windowMs,
      limit,
    };
  }

  return {
    success: false,
    remaining: 0,
    resetInMs: Math.max(0, windowMs - (now - bucket.lastRefill)),
    limit,
  };
}

export function keyFromIp(ip: string | null | undefined, route: string): string {
  return `${route}:${ip ?? "unknown"}`;
}

export function parseIp(forwarded: string | null): string {
  if (!forwarded) return "unknown";
  return forwarded.split(",")[0]?.trim() ?? "unknown";
}

export const RATE_LIMITS = {
  auth: { limit: 10, windowMs: 60_000 },
  api: { limit: 120, windowMs: 60_000 },
  upload: { limit: 20, windowMs: 60_000 },
  reports: { limit: 10, windowMs: 60_000 },
} as const;