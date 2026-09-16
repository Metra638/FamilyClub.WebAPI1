export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
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

export const novaPoshtaRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10_000,
  maxRequests: 30,
});

