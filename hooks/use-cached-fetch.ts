/**
 * Custom hook for fetching data with caching
 * Reduces API calls by caching responses
 */

import { useState, useEffect, useCallback } from "react";
import { cache, CACHE_TTL, CACHE_KEYS } from "@/lib/cache";

interface UseCachedFetchOptions<T> {
  cacheKey: string;
  ttl?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  transform?: (data: any) => T;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useCachedFetch<T = any>(
  fetchFn: () => Promise<T>,
  options: UseCachedFetchOptions<T>
): UseCachedFetchResult<T> {
  const {
    cacheKey,
    ttl = CACHE_TTL.USER_DATA,
    enabled = true,
    onError,
    transform,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    // Try to get from cache on mount
    const cached = cache.get<T>(cacheKey);
    return cached;
  });

  const [isLoading, setIsLoading] = useState<boolean>(!data && enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try cache first
      const cached = cache.get<T>(cacheKey);
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const response = await fetchFn();
      const transformedData = transform ? transform(response) : response;

      // Cache the response
      cache.set(cacheKey, transformedData, ttl);
      setData(transformedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch data");
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, cacheKey, ttl, enabled, transform, onError]);

  useEffect(() => {
    if (enabled && !data) {
      fetchData();
    }
  }, [enabled, data, fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(cacheKey);
    setData(null);
  }, [cacheKey]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    clearCache,
  };
}

