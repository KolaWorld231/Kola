/**
 * Unit Tests - Cache Utility
 * 
 * Tests the cache utility functions:
 * - get/set
 * - TTL expiration
 * - cleanup
 * - Cache configuration
 */

import { cache, CACHE_TTL, CACHE_KEYS } from "@/lib/cache";

describe("Cache Utility", () => {
  beforeEach(() => {
    cache.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    cache.clear();
  });

  describe("get and set", () => {
    it("should set and get cached data", () => {
      const key = "test-key";
      const data = { test: "data" };

      cache.set(key, data);
      const result = cache.get(key);

      expect(result).toEqual(data);
    });

    it("should return null for non-existent keys", () => {
      const result = cache.get("non-existent");

      expect(result).toBeNull();
    });

    it("should return null for expired entries", () => {
      const key = "test-key";
      const data = { test: "data" };
      const ttl = 1000; // 1 second

      cache.set(key, data, ttl);
      
      // Fast-forward time past TTL
      jest.advanceTimersByTime(1001);
      
      const result = cache.get(key);

      expect(result).toBeNull();
    });

    it("should return data before TTL expires", () => {
      const key = "test-key";
      const data = { test: "data" };
      const ttl = 1000; // 1 second

      cache.set(key, data, ttl);
      
      // Fast-forward time but before TTL
      jest.advanceTimersByTime(500);
      
      const result = cache.get(key);

      expect(result).toEqual(data);
    });
  });

  describe("delete", () => {
    it("should delete cached data", () => {
      const key = "test-key";
      const data = { test: "data" };

      cache.set(key, data);
      cache.delete(key);
      const result = cache.get(key);

      expect(result).toBeNull();
    });

    it("should handle deleting non-existent keys gracefully", () => {
      expect(() => {
        cache.delete("non-existent");
      }).not.toThrow();
    });
  });

  describe("clear", () => {
    it("should clear all cached data", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      expect(cache.size()).toBe(2);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("should remove expired entries", () => {
      cache.set("expired", "data", 1000); // Expires in 1 second
      cache.set("valid", "data", 10000); // Expires in 10 seconds

      expect(cache.size()).toBe(2);

      // Fast-forward time past first entry's TTL
      jest.advanceTimersByTime(1001);
      
      cache.cleanup();

      expect(cache.size()).toBe(1);
      expect(cache.get("expired")).toBeNull();
      expect(cache.get("valid")).toEqual("data");
    });
  });

  describe("size", () => {
    it("should return correct cache size", () => {
      expect(cache.size()).toBe(0);

      cache.set("key1", "value1");
      expect(cache.size()).toBe(1);

      cache.set("key2", "value2");
      expect(cache.size()).toBe(2);

      cache.delete("key1");
      expect(cache.size()).toBe(1);
    });
  });

  describe("CACHE_TTL", () => {
    it("should have correct TTL values", () => {
      expect(CACHE_TTL.LANGUAGES).toBe(30 * 60 * 1000); // 30 minutes
      expect(CACHE_TTL.LESSON_METADATA).toBe(15 * 60 * 1000); // 15 minutes
      expect(CACHE_TTL.USER_DATA).toBe(5 * 60 * 1000); // 5 minutes
      expect(CACHE_TTL.ANALYTICS).toBe(5 * 60 * 1000); // 5 minutes
      expect(CACHE_TTL.STATIC).toBe(60 * 60 * 1000); // 1 hour
    });
  });

  describe("CACHE_KEYS", () => {
    it("should generate correct cache keys", () => {
      expect(CACHE_KEYS.languages()).toBe("languages");
      expect(CACHE_KEYS.lesson("test-id")).toBe("lesson:test-id");
      expect(CACHE_KEYS.userCourses("user-123")).toBe("user:courses:user-123");
      expect(CACHE_KEYS.analytics("user-123", "30d")).toBe("analytics:user-123:30d");
    });
  });

  describe("automatic cleanup", () => {
    it("should automatically cleanup expired entries", () => {
      cache.set("expired1", "data1", 1000);
      cache.set("expired2", "data2", 1000);
      cache.set("valid1", "data3", 10000);

      expect(cache.size()).toBe(3);

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      // Cleanup should have run (every 5 minutes)
      expect(cache.get("expired1")).toBeNull();
      expect(cache.get("expired2")).toBeNull();
      expect(cache.get("valid1")).toEqual("data3");
    });
  });
});

