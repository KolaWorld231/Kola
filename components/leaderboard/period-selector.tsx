"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Clock, CalendarDays, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly" | "all_time";

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  className?: string;
}

const periodConfig: Record<Period, { label: string; icon: typeof Calendar; color: string }> = {
  daily: {
    label: "Today",
    icon: Clock,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  weekly: {
    label: "This Week",
    icon: Calendar,
    color: "bg-liberian-red hover:bg-liberian-red/90",
  },
  monthly: {
    label: "This Month",
    icon: CalendarDays,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  all_time: {
    label: "All Time",
    icon: Globe,
    color: "bg-green-500 hover:bg-green-600",
  },
};

export function PeriodSelector({ period, onPeriodChange, className }: PeriodSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {(Object.keys(periodConfig) as Period[]).map((p) => {
        const config = periodConfig[p];
        const Icon = config.icon;
        const isSelected = period === p;

        return (
          <Button
            key={p}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(p)}
            className={cn(
              "flex items-center gap-2 transition-all",
              isSelected
                ? `${config.color} text-white shadow-md`
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}


