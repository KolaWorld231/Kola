"use client";

import { Trophy, Medal, Award, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ rank, className, size = "md" }: RankBadgeProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-sm",
    md: "h-7 w-7 text-lg",
    lg: "h-10 w-10 text-2xl",
  };

  const iconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (rank === 1) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Crown className={cn(iconSizeClasses[size], "text-yellow-500 fill-yellow-500")} />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Medal className={cn(iconSizeClasses[size], "text-gray-400 fill-gray-400")} />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Medal className={cn(iconSizeClasses[size], "text-orange-400 fill-orange-400")} />
      </div>
    );
  }

  if (rank <= 10) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Award className={cn(iconSizeClasses[size], "text-blue-500 fill-blue-500")} />
        <span className={cn("ml-1 font-bold text-blue-600", sizeClasses[size])}>#{rank}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <span className={cn("font-semibold text-gray-400", sizeClasses[size])}>#{rank}</span>
    </div>
  );
}


