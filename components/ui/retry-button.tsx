"use client";

import { Button } from "./button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "lg" | "default" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function RetryButton({
  onRetry,
  variant = "outline",
  size = "sm",
  className,
  children,
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRetry}
      disabled={isRetrying}
      className={cn("gap-2", className)}
    >
      <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
      {children || "Retry"}
    </Button>
  );
}

/**
 * Enhanced error message component with retry functionality
 */
interface EnhancedErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void | Promise<void>;
  className?: string;
  showIcon?: boolean;
}

export function EnhancedErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className,
  showIcon = true,
}: EnhancedErrorMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-900 mb-1">{title}</h3>
          <p className="text-sm text-red-700 mb-3">{message}</p>
          {onRetry && (
            <RetryButton onRetry={onRetry} variant="outline" size="sm">
              Try Again
            </RetryButton>
          )}
        </div>
      </div>
    </div>
  );
}


