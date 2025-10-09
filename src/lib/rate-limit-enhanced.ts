// Enhanced rate limiting with support for both in-memory and Redis

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private bucket = new Map<string, RateLimitRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { windowMs: 60_000, maxRequests: 10 }) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60_000);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = this.bucket.get(identifier);

    // No record or expired window
    if (!record || now >= record.resetAt) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetAt: now + this.config.windowMs,
      };
      this.bucket.set(identifier, newRecord);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: newRecord.resetAt,
      };
    }

    // Within window - check limit
    if (record.count < this.config.maxRequests) {
      record.count++;
      return {
        allowed: true,
        remaining: this.config.maxRequests - record.count,
        resetAt: record.resetAt,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.bucket.entries()) {
      if (now >= record.resetAt) {
        this.bucket.delete(key);
      }
    }
  }

  // Get current stats for an identifier
  getStats(identifier: string): { requests: number; remaining: number; resetAt: number | null } {
    const record = this.bucket.get(identifier);
    if (!record || Date.now() >= record.resetAt) {
      return { requests: 0, remaining: this.config.maxRequests, resetAt: null };
    }
    return {
      requests: record.count,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetAt: record.resetAt,
    };
  }
}

// Export singleton instance
export const ratelimit = new RateLimiter({
  windowMs: 60_000, // 1 minute
  maxRequests: 10,  // 10 requests per minute
});

// For future Redis implementation:
/*
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function checkRateLimit(identifier: string) {
  const key = `ratelimit:${identifier}`;
  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.expire(key, 60); // 60 seconds
  }
  
  return {
    allowed: requests <= 10,
    remaining: Math.max(0, 10 - requests),
  };
}
*/
