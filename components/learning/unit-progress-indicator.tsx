"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface UnitProgressIndicatorProps {
  completedLessons: number;
  totalLessons: number;
  unitTitle: string;
  unitOrder: number;
  className?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Unit progress indicator component
 * Shows completion percentage and visual progress bar for a unit
 */
export function UnitProgressIndicator({
  completedLessons,
  totalLessons,
  unitTitle,
  unitOrder,
  className,
  showPercentage = true,
  size = "md",
}: UnitProgressIndicatorProps) {
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const isCompleted = completedLessons === totalLessons;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "w-full space-y-2 p-4 rounded-lg border-2 transition-all",
        isCompleted
          ? "bg-green-50 border-green-300"
          : "bg-background border-border",
        className
      )}
      role="progressbar"
      aria-label={`Unit ${unitOrder}: ${unitTitle} progress`}
      aria-valuenow={completedLessons}
      aria-valuemin={0}
      aria-valuemax={totalLessons}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <h3 className={cn("font-semibold text-foreground truncate", sizeClasses[size])}>
              Unit {unitOrder}: {unitTitle}
            </h3>
          </div>
        </div>

        {/* Percentage/Count */}
        {showPercentage && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={cn(
                "font-bold tabular-nums",
                isCompleted ? "text-green-600" : "text-foreground",
                sizeClasses[size]
              )}
            >
              {completedLessons}/{totalLessons}
            </span>
            <span
              className={cn(
                "text-foreground-light tabular-nums",
                isCompleted && "text-green-600",
                sizeClasses[size === "lg" ? "md" : "sm"]
              )}
            >
              ({Math.round(progress)}%)
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={progress}
        variant={isCompleted ? "success" : "default"}
        className={cn(size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2")}
        aria-hidden="true"
      />
    </div>
  );
}


