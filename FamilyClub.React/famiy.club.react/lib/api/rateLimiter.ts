export interface RateLimitOptions {
  windowMs: number; // Window size in milliseconds
  maxRequests: number; // Max requests allowed per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Timestamp in milliseconds when the window resets
}

export class SlidingWindowRateLimiter {
  private hits = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
  }

  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.hits.get(identifier) || [];
    // Keep only timestamps within the sliding window
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestInWindow = validTimestamps[0] || now;
      const resetTime = oldestInWindow + this.windowMs;
      this.hits.set(identifier, validTimestamps);
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: resetTime,
      };
    }

    validTimestamps.push(now);
    this.hits.set(identifier, validTimestamps);

    // Garbage collect stale keys if map grows large
    if (this.hits.size > 2000) {
      this.prune();
    }

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validTimestamps.length,
      reset: now + this.windowMs,
    };
  }

  private prune() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, list] of this.hits.entries()) {
      const filtered = list.filter((t) => t > windowStart);
      if (filtered.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, filtered);
      }
    }
  }
}

/** Extract client IP from Next.js request headers. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/** Pre-configured rate limiter instance for Nova Poshta endpoints (max 30 requests per 10s per IP). */
export const novaPoshtaRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10_000, // 10 seconds
  maxRequests: 30, // 30 requests per 10s per IP
});

