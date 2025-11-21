"use client";

import { Flame, Gem, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathStatsBarProps {
  streak: number;
  totalXP?: number;
  hearts: number;
  gems?: number;
  className?: string;
}

/**
 * Stats bar component (Duolingo-inspired)
 * Displays key user metrics at the top of the learning path
 */
export function PathStatsBar({
  streak,
  totalXP,
  hearts,
  gems,
  className,
}: PathStatsBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 md:gap-6 lg:gap-8 px-3 md:px-4 py-2 md:py-3 bg-background border-b border-border",
        className
      )}
      role="status"
      aria-label="Learning statistics"
    >
      {/* Streak */}
      <div className="flex items-center gap-1.5 md:gap-2" aria-label={`Current streak: ${streak} days`}>
        <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500 fill-orange-500" aria-hidden="true" />
        <span className="text-base md:text-lg font-semibold text-foreground tabular-nums">{streak}</span>
      </div>

      {/* Gems/XP */}
      {(gems !== undefined || totalXP !== undefined) && (
        <div
          className="flex items-center gap-1.5 md:gap-2"
          aria-label={gems !== undefined ? `${gems} gems` : `${totalXP?.toLocaleString() || 0} total XP`}
        >
          <Gem className="h-4 w-4 md:h-5 md:w-5 text-liberian-blue fill-liberian-blue" aria-hidden="true" />
          <span className="text-base md:text-lg font-semibold text-foreground tabular-nums">
            {gems !== undefined ? gems : totalXP?.toLocaleString() || 0}
          </span>
        </div>
      )}

      {/* Hearts */}
      <div className="flex items-center gap-1.5 md:gap-2" aria-label={`${hearts} hearts remaining`}>
        <Heart className="h-4 w-4 md:h-5 md:w-5 text-destructive fill-destructive" aria-hidden="true" />
        <span className="text-base md:text-lg font-semibold text-foreground tabular-nums">{hearts}</span>
      </div>
    </div>
  );
}

