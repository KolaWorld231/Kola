"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface SectionProgressBarProps {
  completedUnits: number;
  totalUnits: number;
  sectionTitle?: string;
  sectionNumber?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Section progress bar component
 * Shows overall progress for a section (group of units)
 */
export function SectionProgressBar({
  completedUnits,
  totalUnits,
  sectionTitle,
  sectionNumber,
  className,
  size = "md",
}: SectionProgressBarProps) {
  const progress = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;
  const isCompleted = completedUnits === totalUnits;

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
      aria-label={
        sectionTitle
          ? `Section ${sectionNumber}: ${sectionTitle} progress`
          : `Section ${sectionNumber} progress`
      }
      aria-valuenow={completedUnits}
      aria-valuemin={0}
      aria-valuemax={totalUnits}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen
            className={cn(
              "flex-shrink-0",
              isCompleted ? "text-green-600" : "text-foreground-light",
              size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            {sectionTitle ? (
              <h3 className={cn("font-semibold text-foreground truncate", sizeClasses[size])}>
                {sectionTitle}
              </h3>
            ) : (
              <h3 className={cn("font-semibold text-foreground", sizeClasses[size])}>
                Section {sectionNumber}
              </h3>
            )}
          </div>
        </div>

        {/* Percentage/Count */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={cn(
              "font-bold tabular-nums",
              isCompleted ? "text-green-600" : "text-foreground",
              sizeClasses[size]
            )}
          >
            {completedUnits}/{totalUnits}
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

