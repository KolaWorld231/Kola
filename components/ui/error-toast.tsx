"use client";

import { toast } from "sonner";
import { AppError, getUserFriendlyMessage, isRetryableError } from "@/lib/error-handler";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Show error toast with retry option if applicable
 */
export function showErrorToast(
  error: AppError | Error | unknown,
  retry?: () => void
): void {
  const appError: AppError =
    error instanceof Error
      ? { message: error.message, code: error.name }
      : (error as AppError);

  const message = getUserFriendlyMessage(appError);
  const canRetry = retry && isRetryableError(appError);

  toast.error(message, {
    description: appError.code ? `Error: ${appError.code}` : undefined,
    duration: canRetry ? 6000 : 4000,
    icon: <AlertCircle className="h-5 w-5" />,
    action: canRetry
      ? {
          label: (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Retry
            </span>
          ),
          onClick: retry,
        }
      : undefined,
  });
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string, description?: string): void {
  toast.success(message, {
    description,
    duration: 3000,
  });
}

/**
 * Show info toast
 */
export function showInfoToast(message: string, description?: string): void {
  toast.info(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show warning toast
 */
export function showWarningToast(message: string, description?: string): void {
  toast.warning(message, {
    description,
    duration: 4000,
  });
}







