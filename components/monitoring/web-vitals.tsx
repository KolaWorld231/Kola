"use client";

/**
 * Web Vitals Tracking Component
 * Tracks Core Web Vitals and reports to monitoring services
 */

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from "web-vitals";
import { formatWebVital, sendPerformanceMetric } from "@/lib/monitoring";

/**
 * Track all Core Web Vitals
 */
export function WebVitalsTracker() {
  useEffect(() => {
    // Track Largest Contentful Paint (LCP)
    onLCP((metric: Metric) => {
      const formatted = formatWebVital(metric);
      sendPerformanceMetric(formatted);
    });

    // Track Interaction to Next Paint (INP)
    // Note: INP has replaced FID as the preferred metric
    onINP((metric: Metric) => {
      const formatted = formatWebVital(metric);
      sendPerformanceMetric(formatted);
    });

    // Track Cumulative Layout Shift (CLS)
    onCLS((metric: Metric) => {
      const formatted = formatWebVital(metric);
      sendPerformanceMetric(formatted);
    });

    // Track First Contentful Paint (FCP)
    onFCP((metric: Metric) => {
      const formatted = formatWebVital(metric);
      sendPerformanceMetric(formatted);
    });

    // Track Time to First Byte (TTFB)
    onTTFB((metric: Metric) => {
      const formatted = formatWebVital(metric);
      sendPerformanceMetric(formatted);
    });
  }, []);

  // This component doesn't render anything
  return null;
}

