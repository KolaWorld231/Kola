"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, CheckCircle2, Trophy, Flame, Gift, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotificationStream } from "./notification-stream";
import { usePolling } from "@/lib/hooks/use-polling";

interface Notification {
  id: string;
  type: "achievement" | "streak" | "challenge" | "daily_goal" | "milestone";
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

export function NotificationCenter() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  // Poll for new notifications every 30 seconds when panel is closed
  usePolling(
    async () => {
      if (!isOpen && session?.user?.id) {
        const lastNotificationTime = notifications[0]?.createdAt
          ? new Date(notifications[0].createdAt).toISOString()
          : undefined;

        try {
          const params = new URLSearchParams();
          if (lastNotificationTime) {
            params.append("since", lastNotificationTime);
          }

          const response = await fetch(`/api/notifications/latest?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            if (data.notifications && data.notifications.length > 0) {
              // Add new notifications to the beginning
              setNotifications((prev) => {
                const existingIds = new Set(prev.map((n) => n.id));
                const newOnes = data.notifications.filter(
                  (n: Notification) => !existingIds.has(n.id)
                );
                return [...newOnes, ...prev];
              });
              // Show toast for new notifications
              data.notifications.slice(0, 3).forEach((notif: Notification) => {
                toast.info(notif.title, {
                  description: notif.message,
                  duration: 5000,
                });
              });
            }
          }
        } catch (error) {
          // Silent fail for polling
          console.error("Error polling notifications:", error);
        }
      }
    },
    { interval: 30000, enabled: !!session?.user?.id }
  );

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-5 w-5 text-liberian-gold" />;
      case "streak":
        return <Flame className="h-5 w-5 text-liberian-red" />;
      case "challenge":
        return <Gift className="h-5 w-5 text-liberian-blue" />;
      case "daily_goal":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "milestone":
        return <TrendingUp className="h-5 w-5 text-liberian-blue" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="relative">
      {/* Real-time notification stream */}
      <NotificationStream onNewNotification={fetchNotifications} />
      
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-liberian-red text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <Card className="absolute right-0 top-12 w-80 md:w-96 max-h-[500px] overflow-y-auto z-50 shadow-xl border-2">
            <CardHeader className="sticky top-0 bg-white z-10 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  {unreadCount > 0 && (
                    <CardDescription>
                      {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You&apos;ll see updates here as you learn!
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                        !notification.read && "bg-liberian-blue/5"
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                !notification.read && "text-liberian-blue"
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-liberian-blue flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

