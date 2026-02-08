"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Trophy, Flame, BookOpen, Target, Award, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { AchievementCard } from "./achievement-card";
import { AchievementCategoryFilter } from "./achievement-category-filter";

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

interface AchievementStatistics {
  unlocked: number;
  total: number;
  progress: number;
  totalXPEarned: number;
}

interface AchievementGalleryProps {
  userId: string;
}

type CategoryFilter = "all" | "lesson" | "streak" | "exercise" | "special";

export function AchievementGallery({ userId }: AchievementGalleryProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [statistics, setStatistics] = useState<AchievementStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/achievements");
      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      const data = await response.json();
      setAchievements(data.achievements || []);
      setStatistics(data.statistics || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching achievements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: CategoryFilter) => {
    switch (category) {
      case "lesson":
        return <BookOpen className="h-4 w-4" />;
      case "streak":
        return <Flame className="h-4 w-4" />;
      case "exercise":
        return <Target className="h-4 w-4" />;
      case "special":
        return <Award className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: CategoryFilter) => {
    switch (category) {
      case "lesson":
        return "Lessons";
      case "streak":
        return "Streaks";
      case "exercise":
        return "Exercises";
      case "special":
        return "Special";
      default:
        return "All";
    }
  };

  const categories: CategoryFilter[] = ["all", "lesson", "streak", "exercise", "special"];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error loading achievements"
        message={error}
        onRetry={fetchAchievements}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Progress Overview
            </CardTitle>
            <CardDescription>
              {statistics.unlocked} of {statistics.total} achievements unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground dark:text-foreground-darkMode">
                    Overall Progress
                  </span>
                  <span className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
                    {Math.round(statistics.progress)}%
                  </span>
                </div>
                <ProgressBar value={statistics.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <div className="text-2xl font-bold text-primary">
                    {statistics.unlocked}
                  </div>
                  <div className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
                    Unlocked
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-success/10 dark:bg-success/20">
                  <div className="text-2xl font-bold text-success">
                    +{statistics.totalXPEarned}
                  </div>
                  <div className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
                    XP Earned
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-warning/10 dark:bg-warning/20">
                  <div className="text-2xl font-bold text-warning">
                    {statistics.total - statistics.unlocked}
                  </div>
                  <div className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
                    Remaining
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            getCategoryIcon={getCategoryIcon}
            getCategoryLabel={getCategoryLabel}
          />
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground dark:text-foreground-darkMode">
            {getCategoryLabel(selectedCategory)} Achievements
          </h2>
          <p className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
            {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredAchievements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-foreground-light dark:text-foreground-darkModeLight">
                No achievements found in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


