/**
 * Client-side caching utility
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cleanup expired entries every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Cache configuration for different data types
 */
export const CACHE_TTL = {
  LANGUAGES: 30 * 60 * 1000, // 30 minutes - languages rarely change
  LESSON_METADATA: 15 * 60 * 1000, // 15 minutes - lesson metadata
  USER_DATA: 5 * 60 * 1000, // 5 minutes - user data can change
  ANALYTICS: 5 * 60 * 1000, // 5 minutes - analytics data
  STATIC: 60 * 60 * 1000, // 1 hour - static content
} as const;

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  languages: () => "languages",
  lesson: (id: string) => `lesson:${id}`,
  userCourses: (userId: string) => `user:courses:${userId}`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
} as const;

