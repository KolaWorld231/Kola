/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals, API performance, and custom metrics
 */

import { Metric } from "web-vitals";

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
  id?: string;
  navigationType?: string;
  url?: string;
  timestamp?: number;
}

export interface APIMetric {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  error?: string;
}

// Performance thresholds based on Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift (score)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
};

/**
 * Get performance rating based on thresholds
 */
export function getPerformanceRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Convert Web Vitals Metric to PerformanceMetric
 */
export function formatWebVital(metric: Metric): PerformanceMetric {
  const rating = getPerformanceRating(metric.name, metric.value);
  
  return {
    name: metric.name,
    value: metric.value,
    rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    timestamp: Date.now(),
  };
}

/**
 * Send performance metric to monitoring service
 */
export async function sendPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  // Only send in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Performance] Metric:", metric);
    return;
  }

  try {
    // Send to Sentry (if configured)
    if (typeof window !== "undefined" && (window as any).Sentry) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.addBreadcrumb({
        category: "performance",
        message: `${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
        level: metric.rating === "poor" ? "warning" : "info",
        data: metric,
      });

      // Log poor performance as events
      if (metric.rating === "poor") {
        Sentry.captureMessage(`Poor ${metric.name} performance: ${metric.value.toFixed(2)}`, {
          level: "warning",
          tags: {
            metric: metric.name,
            rating: metric.rating,
          },
          extra: metric,
        });
      }
    }

    // Send to custom API endpoint (optional)
    if (process.env.NEXT_PUBLIC_MONITORING_API) {
      await fetch(process.env.NEXT_PUBLIC_MONITORING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "performance",
          metric,
        }),
        keepalive: true, // Don't block page unload
      });
    }
  } catch (error) {
    // Silently fail - don't break the app
    console.debug("[Performance] Failed to send metric:", error);
  }
}

/**
 * Send API performance metric
 */
export async function sendAPIMetric(metric: APIMetric): Promise<void> {
  // Only send in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[API Performance] Metric:", metric);
    return;
  }

  try {
    // Send to Sentry (if configured)
    if (typeof require !== "undefined") {
      try {
        const Sentry = await import("@sentry/nextjs");
        Sentry.addBreadcrumb({
          category: "api",
          message: `${metric.method} ${metric.endpoint}: ${metric.status} (${metric.duration}ms)`,
          level: metric.status >= 500 ? "error" : metric.status >= 400 ? "warning" : "info",
          data: metric,
        });

        // Log slow API calls
        if (metric.duration > 1000) {
          Sentry.captureMessage(`Slow API call: ${metric.endpoint} took ${metric.duration}ms`, {
            level: "warning",
            tags: {
              endpoint: metric.endpoint,
              method: metric.method,
            },
            extra: metric,
          });
        }
      } catch (err) {
        // Sentry not available
      }
    }

    // Send to custom API endpoint (optional)
    if (process.env.NEXT_PUBLIC_MONITORING_API) {
      await fetch(process.env.NEXT_PUBLIC_MONITORING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "api",
          metric,
        }),
        keepalive: true,
      });
    }
  } catch (error) {
    // Silently fail
    console.debug("[API Performance] Failed to send metric:", error);
  }
}

/**
 * Track custom performance metric
 */
export function trackCustomMetric(name: string, value: number, _unit: string = "ms"): void {
  if (typeof window === "undefined") return;

  const metric: PerformanceMetric = {
    name,
    value,
    rating: "good", // Custom metrics don't have thresholds
    timestamp: Date.now(),
    url: window.location.href,
  };

  sendPerformanceMetric(metric);
}

/**
 * Measure function execution time
 */
export async function measureExecutionTime<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    trackCustomMetric(`${name}_duration`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackCustomMetric(`${name}_duration_error`, duration);
    throw error;
  }
}

