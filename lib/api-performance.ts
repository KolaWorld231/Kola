/**
 * API Performance Monitoring
 * Wrapper for fetch to track API performance metrics
 */

import { sendAPIMetric, APIMetric } from "./monitoring";

/**
 * Enhanced fetch with performance tracking
 */
export async function trackedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const start = Date.now();
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method || "GET";

  try {
    const response = await fetch(input, init);
    const duration = Date.now() - start;

    // Track API metric
    const metric: APIMetric = {
      endpoint: url,
      method,
      status: response.status,
      duration,
      timestamp: Date.now(),
    };

    await sendAPIMetric(metric);

    return response;
  } catch (error) {
    const duration = Date.now() - start;

    // Track error metric
    const metric: APIMetric = {
      endpoint: url,
      method,
      status: 0,
      duration,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : String(error),
    };

    await sendAPIMetric(metric);

    throw error;
  }
}

/**
 * Measure API endpoint execution time
 */
export async function measureAPITime<T>(
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;

    const metric: APIMetric = {
      endpoint,
      method: "GET",
      status: 200,
      duration,
      timestamp: Date.now(),
    };

    await sendAPIMetric(metric);
    return result;
  } catch (error) {
    const duration = Date.now() - start;

    const metric: APIMetric = {
      endpoint,
      method: "GET",
      status: 500,
      duration,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : String(error),
    };

    await sendAPIMetric(metric);
    throw error;
  }
}

