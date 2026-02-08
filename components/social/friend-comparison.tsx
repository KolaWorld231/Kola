"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Trophy, Flame, TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FriendStats {
  id: string;
  name: string | null;
  image: string | null;
  totalXP: number;
  currentStreak: number;
  lessonsCompleted: number;
  achievementsCount: number;
}

interface FriendComparisonProps {
  currentUser: FriendStats;
  friend: FriendStats;
  className?: string;
}

export function FriendComparison({ currentUser, friend, className }: FriendComparisonProps) {
  const compareValue = (
    current: number,
    friendValue: number,
    higherIsBetter: boolean = true
  ) => {
    const diff = current - friendValue;
    const percent = friendValue > 0 ? (diff / friendValue) * 100 : 0;

    if (diff === 0) {
      return { icon: Minus, color: "text-gray-500", label: "Tie" };
    }

    if (higherIsBetter) {
      return diff > 0
        ? {
            icon: TrendingUp,
            color: "text-green-600",
            label: `+${diff.toLocaleString()} (+${Math.abs(percent).toFixed(1)}%)`,
          }
        : {
            icon: TrendingDown,
            color: "text-red-600",
            label: `${diff.toLocaleString()} (${percent.toFixed(1)}%)`,
          };
    } else {
      return diff < 0
        ? {
            icon: TrendingUp,
            color: "text-green-600",
            label: `${diff.toLocaleString()} (${percent.toFixed(1)}%)`,
          }
        : {
            icon: TrendingDown,
            color: "text-red-600",
            label: `+${diff.toLocaleString()} (+${Math.abs(percent).toFixed(1)}%)`,
          };
    }
  };

  const xpComparison = compareValue(currentUser.totalXP, friend.totalXP);
  const streakComparison = compareValue(currentUser.currentStreak, friend.currentStreak);
  const lessonsComparison = compareValue(
    currentUser.lessonsCompleted,
    friend.lessonsCompleted
  );
  const achievementsComparison = compareValue(
    currentUser.achievementsCount,
    friend.achievementsCount
  );

  const maxXP = Math.max(currentUser.totalXP, friend.totalXP);
  const maxStreak = Math.max(currentUser.currentStreak, friend.currentStreak);
  const maxLessons = Math.max(currentUser.lessonsCompleted, friend.lessonsCompleted);
  const maxAchievements = Math.max(
    currentUser.achievementsCount,
    friend.achievementsCount
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Compare Progress
        </CardTitle>
        <CardDescription>See how you stack up against your friend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Comparison */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser.image ? (
              <Image
                src={currentUser.image}
                alt={currentUser.name || "You"}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-liberian-blue text-white flex items-center justify-center font-semibold">
                {currentUser.name?.[0]?.toUpperCase() || "Y"}
              </div>
            )}
            <span className="font-semibold">You</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{friend.name || "Friend"}</span>
            {friend.image ? (
              <Image
                src={friend.image}
                alt={friend.name || "Friend"}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-liberian-blue text-white flex items-center justify-center font-semibold">
                {friend.name?.[0]?.toUpperCase() || "F"}
              </div>
            )}
          </div>
        </div>

        {/* XP Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-liberian-gold" />
              <span className="text-sm font-medium">Total XP</span>
            </div>
            <div className={cn("flex items-center gap-1 text-xs font-medium", xpComparison.color)}>
              <xpComparison.icon className="h-3 w-3" />
              <span>{xpComparison.label}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>You</span>
                <span className="font-semibold">{currentUser.totalXP.toLocaleString()}</span>
              </div>
              <ProgressBar
                value={(currentUser.totalXP / maxXP) * 100}
                className="h-2"
                variant="default"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{friend.name || "Friend"}</span>
                <span className="font-semibold">{friend.totalXP.toLocaleString()}</span>
              </div>
              <ProgressBar
                value={(friend.totalXP / maxXP) * 100}
                className="h-2"
                variant="default"
              />
            </div>
          </div>
        </div>

        {/* Streak Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                streakComparison.color
              )}
            >
              <streakComparison.icon className="h-3 w-3" />
              <span>{streakComparison.label}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>You</span>
                <span className="font-semibold">{currentUser.currentStreak}</span>
              </div>
              <ProgressBar
                value={(currentUser.currentStreak / Math.max(maxStreak, 1)) * 100}
                className="h-2"
                variant="default"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{friend.name || "Friend"}</span>
                <span className="font-semibold">{friend.currentStreak}</span>
              </div>
              <ProgressBar
                value={(friend.currentStreak / Math.max(maxStreak, 1)) * 100}
                className="h-2"
                variant="default"
              />
            </div>
          </div>
        </div>

        {/* Lessons Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-liberian-blue" />
              <span className="text-sm font-medium">Lessons Completed</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                lessonsComparison.color
              )}
            >
              <lessonsComparison.icon className="h-3 w-3" />
              <span>{lessonsComparison.label}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>You</span>
                <span className="font-semibold">{currentUser.lessonsCompleted}</span>
              </div>
              <ProgressBar
                value={(currentUser.lessonsCompleted / Math.max(maxLessons, 1)) * 100}
                className="h-2"
                variant="default"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{friend.name || "Friend"}</span>
                <span className="font-semibold">{friend.lessonsCompleted}</span>
              </div>
              <ProgressBar
                value={(friend.lessonsCompleted / Math.max(maxLessons, 1)) * 100}
                className="h-2"
                variant="default"
              />
            </div>
          </div>
        </div>

        {/* Achievements Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-liberian-gold" />
              <span className="text-sm font-medium">Achievements</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                achievementsComparison.color
              )}
            >
              <achievementsComparison.icon className="h-3 w-3" />
              <span>{achievementsComparison.label}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>You</span>
                <span className="font-semibold">{currentUser.achievementsCount}</span>
              </div>
              <ProgressBar
                value={(currentUser.achievementsCount / Math.max(maxAchievements, 1)) * 100}
                className="h-2"
                variant="default"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{friend.name || "Friend"}</span>
                <span className="font-semibold">{friend.achievementsCount}</span>
              </div>
              <ProgressBar
                value={(friend.achievementsCount / Math.max(maxAchievements, 1)) * 100}
                className="h-2"
                variant="default"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


