import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

/**
 * API Performance Monitoring & Logging Middleware
 * Tracks API request/response times, logs requests, and reports to monitoring services
 */
export function middleware(request: NextRequest) {
  // Only monitor API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Create request-scoped logger
  const requestLogger = logger.child({
    requestId,
    method: request.method,
    endpoint: request.nextUrl.pathname,
  });

  // Log incoming request
  requestLogger.info("API request started", {
    query: Object.fromEntries(request.nextUrl.searchParams),
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
  });

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-request-start", start.toString());

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Track response time
  const duration = Date.now() - start;

  // Log response
  setTimeout(() => {
    requestLogger.info("API request completed", {
      status: response.status,
      duration: `${duration}ms`,
    });

    // Log slow requests
    if (duration > 1000) {
      requestLogger.warn("Slow API request", {
        duration: `${duration}ms`,
        threshold: "1000ms",
      });
    }

    // Log error responses
    if (response.status >= 400) {
      requestLogger.error("API request failed", undefined, {
        status: response.status,
        duration: `${duration}ms`,
      });
    }

    // Log API metrics (async, don't block response)
    if (process.env.NODE_ENV === "production") {
      // Send to monitoring service in background
      logAPIMetric({
        endpoint: request.nextUrl.pathname,
        method: request.method,
        status: response.status,
        duration,
        timestamp: Date.now(),
        requestId,
      }).catch(() => {
        // Silently fail - don't block response
      });
    }
  }, 0);

  // Add performance header
  response.headers.set("x-response-time", `${duration}ms`);
  response.headers.set("x-request-id", requestId);

  return response;
}

/**
 * Log API performance metric
 */
async function logAPIMetric(metric: {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  requestId: string;
}): Promise<void> {
  try {
    // Send to Sentry (if configured)
    if (process.env.SENTRY_DSN) {
      try {
        const Sentry = await import("@sentry/nextjs");
        Sentry.addBreadcrumb({
          category: "api",
          message: `${metric.method} ${metric.endpoint}: ${metric.status} (${metric.duration}ms)`,
          level: metric.status >= 500 ? "error" : metric.status >= 400 ? "warning" : "info",
          data: metric,
        });

        // Log slow API calls (> 1 second)
        if (metric.duration > 1000) {
          Sentry.captureMessage(`Slow API: ${metric.endpoint} took ${metric.duration}ms`, {
            level: "warning",
            tags: {
              endpoint: metric.endpoint,
              method: metric.method,
              requestId: metric.requestId,
            },
            extra: metric,
          });
        }

        // Log error responses (4xx, 5xx)
        if (metric.status >= 400) {
          Sentry.captureMessage(`API Error: ${metric.endpoint} returned ${metric.status}`, {
            level: metric.status >= 500 ? "error" : "warning",
            tags: {
              endpoint: metric.endpoint,
              method: metric.method,
              status: metric.status.toString(),
              requestId: metric.requestId,
            },
            extra: metric,
          });
        }
      } catch (err) {
        // Sentry not available
      }
    }
  } catch (error) {
    // Silently fail
    console.debug("[Middleware] Failed to log API metric:", error);
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
  ],
};

