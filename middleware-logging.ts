import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Request/Response Logging Middleware
 * Logs all API requests and responses with performance metrics
 */
export function loggingMiddleware(request: NextRequest) {
  const start = Date.now();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  
  // Create request-scoped logger
  const requestLogger = logger.child({
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
  });

  // Log request
  requestLogger.info("Incoming API request", {
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
  });

  // Create response with request ID
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  response.headers.set("x-request-id", requestId);

  // Log response after request completes
  const duration = Date.now() - start;
  
  // Use setTimeout to log after response is sent (non-blocking)
  setTimeout(() => {
    requestLogger.info("API request completed", {
      status: response.status,
      duration: `${duration}ms`,
      statusText: response.statusText,
    });

    // Log slow requests
    if (duration > 1000) {
      requestLogger.warn("Slow API request detected", {
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
  }, 0);

  return response;
}

