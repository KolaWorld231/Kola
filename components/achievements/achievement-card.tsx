"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  xpReward: number;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (achievement.unlocked && achievement.unlockedAt) {
      // Check if achievement was unlocked recently (within last 10 seconds)
      const unlockedTime = new Date(achievement.unlockedAt).getTime();
      const now = Date.now();
      const timeSinceUnlock = now - unlockedTime;

      if (timeSinceUnlock < 10000) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [achievement.unlocked, achievement.unlockedAt]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lesson":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "streak":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "exercise":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "special":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          achievement.unlocked
            ? "border-success/50 dark:border-success/50 bg-success/5 dark:bg-success/10"
            : "border-border dark:border-border-darkMode opacity-75",
          isAnimating && "ring-2 ring-success ring-offset-2"
        )}
      >
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
              >
                <Sparkles className="h-16 w-16 text-success" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-300",
                achievement.unlocked
                  ? "bg-success/20 dark:bg-success/30"
                  : "bg-gray-200 dark:bg-gray-700 grayscale"
              )}
            >
              {achievement.unlocked ? (
                <motion.div
                  animate={isAnimating ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {achievement.icon || "🏆"}
                </motion.div>
              ) : (
                <span className="opacity-50">{achievement.icon || "🏆"}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className={cn(
                    "font-semibold text-lg",
                    achievement.unlocked
                      ? "text-foreground dark:text-foreground-darkMode"
                      : "text-foreground-light dark:text-foreground-darkModeLight"
                  )}
                >
                  {achievement.name}
                </h3>
                {achievement.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400 shrink-0" />
                )}
              </div>

              <p
                className={cn(
                  "text-sm mb-3",
                  achievement.unlocked
                    ? "text-foreground-light dark:text-foreground-darkModeLight"
                    : "text-foreground-light dark:text-foreground-darkModeLight opacity-75"
                )}
              >
                {achievement.description}
              </p>

              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn("text-xs", getCategoryColor(achievement.category))}
                >
                  {achievement.category}
                </Badge>

                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      achievement.unlocked
                        ? "text-foreground dark:text-foreground-darkMode"
                        : "text-foreground-light dark:text-foreground-darkModeLight"
                    )}
                  >
                    +{achievement.xpReward} XP
                  </span>
                </div>
              </div>

              {achievement.unlocked && achievement.unlockedAt && (
                <div className="mt-2 text-xs text-foreground-light dark:text-foreground-darkModeLight">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


