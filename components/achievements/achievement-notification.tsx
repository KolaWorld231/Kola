"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: string;
  code: string;
  name: string;
  icon?: string | null;
  xpReward: number;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function AchievementNotification({
  achievement,
  onClose,
  autoClose = true,
  duration = 5000,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(!!achievement);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
    }
  }, [achievement]);

  useEffect(() => {
    if (achievement && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [achievement, autoClose, duration, onClose]);

  if (!achievement || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bounce-in slide-in-right">
      <Card className="border-accent/50 bg-accent/10 shadow-lg min-w-[320px] max-w-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl">{achievement.icon || "🏆"}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-accent flex-shrink-0" />
                <h3 className="font-semibold text-foreground truncate">
                  Achievement Unlocked!
                </h3>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {achievement.name}
              </p>
              <p className="text-xs text-foreground-light">
                +{achievement.xpReward} XP
              </p>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(), 300);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

