/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  toJSON(): AppError {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof ApiError) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return {
        message: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
        statusCode: 0,
      };
    }

    // Check for timeout errors
    if (error.message.includes("timeout") || error.name === "TimeoutError") {
      return {
        message: "Request timed out. Please try again.",
        code: "TIMEOUT_ERROR",
        statusCode: 408,
      };
    }

    return {
      message: error.message || "An unexpected error occurred",
      code: error.name,
      statusCode: 500,
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.code) {
    case "NETWORK_ERROR":
      return "Unable to connect to the server. Please check your internet connection.";
    case "TIMEOUT_ERROR":
      return "The request took too long. Please try again.";
    case "UNAUTHORIZED":
      return "You need to be logged in to perform this action.";
    case "FORBIDDEN":
      return "You don't have permission to perform this action.";
    case "NOT_FOUND":
      return "The requested resource was not found.";
    case "VALIDATION_ERROR":
      return "Please check your input and try again.";
    case "DATABASE_ERROR":
      return "A database error occurred. Please try again later.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  if (!error.statusCode) return true; // Network errors are retryable
  return error.statusCode >= 500 || error.statusCode === 408 || error.statusCode === 429;
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
  console.error("Error:", {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
  });

  // In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === "production") {
  //   Sentry.captureException(error, { extra: context });
  // }
}







