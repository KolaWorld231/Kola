"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Trophy, BookOpen, Flame, Target, Award, Users, Filter, RefreshCw, Bell } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SocialActivity {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isPublic: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    totalXP: number;
    currentStreak: number;
  };
}

type ActivityFilter = "all" | "achievement" | "lesson_completed" | "streak_milestone" | "challenge_won";
type SortOrder = "recent" | "oldest";

export function EnhancedSocialFeed() {
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<SocialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchFeed();
  }, []);

  // Auto-refresh feed every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFeed(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...activities];

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((activity) => activity.type === filter);
    }

    // Apply sort order
    if (sortOrder === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    setFilteredActivities(filtered);
  }, [activities, filter, sortOrder]);

  const fetchFeed = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const response = await fetch("/api/social/feed");
      if (!response.ok) {
        throw new Error("Failed to fetch social feed");
      }

      const data = await response.json();
      const newActivities = data.activities || [];

      // Show notification for new activities if refreshing silently
      if (silent && activities.length > 0) {
        const existingIds = new Set(activities.map((a) => a.id));
        const newOnes = newActivities.filter((a: SocialActivity) => !existingIds.has(a.id));
        if (newOnes.length > 0) {
          toast.info(`${newOnes.length} new activity${newOnes.length > 1 ? "ies" : ""}`, {
            description: "Your friends have been active!",
            icon: <Bell className="h-4 w-4" />,
          });
        }
      }

      setActivities(newActivities);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching social feed:", err);
      if (!silent) {
        toast.error("Failed to load feed");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchFeed(false);
    toast.success("Feed refreshed!");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-5 w-5 text-liberian-gold" />;
      case "lesson_completed":
        return <BookOpen className="h-5 w-5 text-liberian-blue" />;
      case "streak_milestone":
        return <Flame className="h-5 w-5 text-orange-500" />;
      case "challenge_won":
        return <Target className="h-5 w-5 text-green-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "bg-liberian-gold/10 border-liberian-gold/20";
      case "lesson_completed":
        return "bg-liberian-blue/10 border-liberian-blue/20";
      case "streak_milestone":
        return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800";
      case "challenge_won":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700";
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "achievement":
        return <Badge className="bg-liberian-gold text-white">Achievement</Badge>;
      case "lesson_completed":
        return <Badge className="bg-liberian-blue text-white">Lesson</Badge>;
      case "streak_milestone":
        return <Badge className="bg-orange-500 text-white">Streak</Badge>;
      case "challenge_won":
        return <Badge className="bg-green-600 text-white">Challenge</Badge>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const getFilterCount = (filterType: ActivityFilter) => {
    if (filterType === "all") return activities.length;
    return activities.filter((a) => a.type === filterType).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Error loading feed" message={error} onRetry={() => fetchFeed(false)} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Social Feed
            </CardTitle>
            <CardDescription>See what your friends are learning!</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filter} onValueChange={(value) => setFilter(value as ActivityFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({getFilterCount("all")})</SelectItem>
                <SelectItem value="achievement">Achievements ({getFilterCount("achievement")})</SelectItem>
                <SelectItem value="lesson_completed">Lessons ({getFilterCount("lesson_completed")})</SelectItem>
                <SelectItem value="streak_milestone">Streaks ({getFilterCount("streak_milestone")})</SelectItem>
                <SelectItem value="challenge_won">Challenges ({getFilterCount("challenge_won")})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lastUpdate && (
            <span className="text-xs text-gray-400 ml-auto">
              Updated {formatTimeAgo(lastUpdate)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {filter === "all" ? "No activities yet" : `No ${filter} activities`}
            </p>
            <p className="text-sm">Add friends to see their progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 border rounded-lg transition-all hover:shadow-md",
                    getActivityColor(activity.type)
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {activity.user.image ? (
                        <Image
                          src={activity.user.image}
                          alt={activity.user.name || "User"}
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-liberian-red/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-liberian-blue text-white flex items-center justify-center font-semibold text-lg border-2 border-liberian-red/20">
                          {activity.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getActivityIcon(activity.type)}
                        <h3 className="font-semibold text-lg text-foreground dark:text-foreground-darkMode">
                          {activity.user.name || "User"}
                        </h3>
                        {getActivityBadge(activity.type)}
                        <span className="text-sm text-gray-400">·</span>
                        <span className="text-sm text-gray-400">{formatTimeAgo(activity.createdAt)}</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-foreground-darkMode mb-1">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-foreground-darkModeLight mb-3">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-foreground-darkModeLight">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-liberian-gold" />
                          <span>{activity.user.totalXP.toLocaleString()} XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span>{activity.user.currentStreak} day streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


