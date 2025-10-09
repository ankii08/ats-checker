// Simple in-memory cache with TTL
// For production, replace with Redis or similar

import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlMs = 3600000) { // Default 1 hour
    this.ttlMs = ttlMs;
    
    // Cleanup every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  set(key: string, value: T, customTtl?: number): void {
    const expiresAt = Date.now() + (customTtl || this.ttlMs);
    this.store.set(key, { data: value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.store.size,
      ttl: this.ttlMs,
    };
  }
}

// Generate cache key from inputs
export function generateCacheKey(resume: string, jobDesc: string): string {
  const combined = `${resume}|${jobDesc}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

export const analysisCache = new Cache<{
  score: number;
  matched: string[];
  missing: string[];
  suggestions: any;
}>(1800000); // 30 minutes TTL
