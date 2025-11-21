import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface RecentActivityItem {
  id: string;
  type: "lesson" | "exercise";
  title: string;
  language: string;
  xp: number;
  completedAt: Date;
  accuracy?: number;
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
  maxItems?: number;
}

export function RecentActivity({
  activities,
  maxItems = 5,
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-foreground-light dark:text-foreground-darkModeLight">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-foreground-light/50 dark:text-foreground-darkModeLight/50" />
            <p className="mb-4">No recent activity</p>
            <Link href="/learn">
              <Button>Start Learning</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg border border-border dark:border-border-darkMode hover:bg-background-dark dark:hover:bg-background-darkModeSecondary transition-colors"
            >
              <div className="flex-shrink-0">
                {activity.type === "lesson" ? (
                  <BookOpen className="h-5 w-5 text-primary" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground dark:text-foreground-darkMode truncate">
                  {activity.title}
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground-light dark:text-foreground-darkModeLight">
                  <span>{activity.language}</span>
                  {activity.accuracy !== undefined && (
                    <>
                      <span>•</span>
                      <span>{Math.round(activity.accuracy)}% accuracy</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="font-semibold text-success">+{activity.xp}</div>
                <div className="text-xs text-foreground-light dark:text-foreground-darkModeLight">XP</div>
              </div>
            </div>
          ))}
        </div>
        {activities.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-border dark:border-border-darkMode">
            <Link href="/dashboard/activity" className="block text-center">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



