"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RetryButton } from "./retry-button";
import { getUserFriendlyMessage, handleApiError } from "@/lib/error-handler";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void | Promise<void>;
  className?: string;
  error?: unknown;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className,
  error,
}: ErrorMessageProps) {
  // Use error handler if error is provided
  const appError = error ? handleApiError(error) : null;
  const displayMessage = appError ? getUserFriendlyMessage(appError) : message;

  // Determine if this is a retryable error
  const isRetryable = appError 
    ? (appError.code === "NETWORK_ERROR" || 
       appError.code === "TIMEOUT_ERROR" || 
       (typeof appError.statusCode === 'number' && (appError.statusCode === 0 || appError.statusCode === 408 || (appError.statusCode >= 500 && appError.statusCode < 600))))
    : false;

  // Get actionable suggestions based on error type
  const getSuggestions = (): string[] => {
    if (!appError) return [];
    
    switch (appError.code) {
      case "NETWORK_ERROR":
        return [
          "Check your internet connection",
          "Try again in a few moments",
          "If the problem persists, check your network settings"
        ];
      case "TIMEOUT_ERROR":
        return [
          "The request took too long",
          "Try again with a better connection",
          "The server may be busy, please wait a moment"
        ];
      case "UNAUTHORIZED":
        return [
          "You may need to sign in again",
          "Your session may have expired",
          "Please refresh the page and try again"
        ];
      case "FORBIDDEN":
        return [
          "You don't have permission for this action",
          "Contact support if you believe this is an error"
        ];
      case "NOT_FOUND":
        return [
          "The requested resource was not found",
          "It may have been removed or moved",
          "Try navigating back and trying again"
        ];
      default:
        if (typeof appError.statusCode === 'number' && appError.statusCode >= 500) {
          return [
            "This is a server error",
            "We've been notified and are working on it",
            "Please try again in a few moments"
          ];
        }
        return [];
    }
  };

  const suggestions = getSuggestions();
  const showRetry = onRetry && (isRetryable || !appError);

  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-destructive mb-1">{title}</h3>
              <p className="text-sm text-foreground-light">{displayMessage}</p>
            </div>
            
            {suggestions.length > 0 && (
              <div className="bg-destructive/5 rounded-md p-3 space-y-1">
                <p className="text-xs font-medium text-destructive mb-2">What you can try:</p>
                <ul className="text-xs text-foreground-light space-y-1 list-disc list-inside">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {showRetry && (
              <RetryButton onRetry={onRetry} variant="outline" size="sm">
                Try Again
              </RetryButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
