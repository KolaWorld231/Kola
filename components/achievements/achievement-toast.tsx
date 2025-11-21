"use client";

import { toast } from "sonner";

interface Achievement {
  id: string;
  code: string;
  name: string;
  icon?: string | null;
  xpReward: number;
}

export function showAchievementToast(achievement: Achievement) {
  toast.success("Achievement Unlocked!", {
    description: `${achievement.name} - +${achievement.xpReward} XP`,
    icon: achievement.icon || "🏆",
    duration: 5000,
  });
}

