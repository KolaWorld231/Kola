import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  label?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = false,
      variant = "default",
      size = "md",
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayValue = Math.round(percentage);

    const variantClasses = {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-accent",
      danger: "bg-red-600",
    };

    const sizeClasses = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    };

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        role="progressbar"
        aria-valuenow={displayValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${displayValue}%`}
        {...props}
      >
        {showLabel && label && (
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>
            <span className="text-sm text-foreground-light">{displayValue}%</span>
          </div>
        )}
        <div
          className={cn(
            "w-full overflow-hidden rounded-full bg-background-dark",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
            "h-full transition-smooth duration-500 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
        </div>
        {showLabel && !label && (
          <div className="mt-2 text-right text-sm text-foreground-light">
            {displayValue}%
          </div>
        )}
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };

