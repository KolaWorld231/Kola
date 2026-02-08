"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AchievementCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  getCategoryIcon: (category: string) => JSX.Element;
  getCategoryLabel: (category: string) => string;
}

export function AchievementCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  getCategoryIcon,
  getCategoryLabel,
}: AchievementCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <Button
            key={category}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={cn(
              "flex items-center gap-2",
              isSelected && "bg-primary text-white"
            )}
          >
            {getCategoryIcon(category)}
            <span>{getCategoryLabel(category)}</span>
          </Button>
        );
      })}
    </div>
  );
}


