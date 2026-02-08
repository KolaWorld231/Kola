"use client";

import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface UnitBannerProps {
  section: string;
  unit: number;
  title: string;
  color?: "green" | "purple" | "teal" | "blue";
  className?: string;
}

const colorClasses = {
  green: "bg-green-500 hover:bg-green-600",
  purple: "bg-purple-500 hover:bg-purple-600",
  teal: "bg-teal-500 hover:bg-teal-600",
  blue: "bg-liberian-blue hover:bg-liberian-blue/90",
};

/**
 * Prominent unit banner component (Duolingo-inspired)
 * Shows current section and unit with a vibrant, attention-grabbing design
 */
export function UnitBanner({
  section,
  unit,
  title,
  color = "green",
  className,
}: UnitBannerProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl px-6 py-5 text-white shadow-lg transition-all hover:shadow-xl",
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm font-bold uppercase tracking-wider mb-1 opacity-90">
            {section}, UNIT {unit}
          </div>
          <div className="text-xl font-semibold leading-tight">{title}</div>
        </div>
        <div className="flex-shrink-0">
          <List className="h-6 w-6 opacity-90" />
        </div>
      </div>
    </div>
  );
}


