/**
 * API client with centralized error handling
 */

import { handleApiError, AppError, logError } from "./error-handler";

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Make an API request with automatic error handling
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(endpoint, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    let data: unknown;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      const error: AppError = {
        message: "Unexpected response format",
        code: "INVALID_RESPONSE",
        statusCode: response.status,
        details: text.substring(0, 100),
      };
      throw error;
    }

    // Check if response is an error
    if (!response.ok) {
      const error: AppError = {
        message:
          (data as { message?: string; error?: string })?.message ||
          (data as { error?: string })?.error ||
          "An error occurred",
        code: (data as { code?: string })?.code || "API_ERROR",
        statusCode: response.status,
        details: data,
      };
      throw error;
    }

    return data as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Handle abort errors (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError: AppError = {
        message: "Request timed out. Please try again.",
        code: "TIMEOUT_ERROR",
        statusCode: 408,
      };
      logError(timeoutError, { endpoint, options });
      throw timeoutError;
    }

    // Handle fetch errors (network)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const networkError: AppError = {
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
        statusCode: 0,
      };
      logError(networkError, { endpoint, options, originalError: error.message });
      throw networkError;
    }

    // If it's already an AppError, re-throw it
    if (error && typeof error === "object" && "code" in error) {
      logError(error as AppError, { endpoint, options });
      throw error;
    }

    // Handle unknown errors
    const appError = handleApiError(error);
    logError(appError, { endpoint, options });
    throw appError;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, "method" | "body">
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}






