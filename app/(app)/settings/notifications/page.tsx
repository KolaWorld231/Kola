"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useBrowserNotifications } from "@/lib/hooks/use-browser-notifications";

interface UserSettings {
  id: string;
  emailProductUpdates: boolean;
  emailNewFollower: boolean;
  emailFriendActivity: boolean;
  emailWeeklyProgress: boolean;
  emailSpecialPromotions: boolean;
  emailResearchOpportunities: boolean;
  emailPracticeReminder: boolean;
  practiceReminderTime: string | null;
  browserNotifications?: boolean;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const reminderCancelRef = useRef<(() => void) | null>(null);

  const {
    isSupported: browserNotificationsSupported,
    permission: browserPermission,
    isRequesting: isRequestingPermission,
    requestPermission: requestBrowserPermission,
    setupReminder,
  } = useBrowserNotifications();

  const reminderTimes = [
    "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
    "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: boolean | string | null) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully");
        setHasChanges(false);

        // Setup browser reminder if enabled and permission granted
        if (settings.emailPracticeReminder && settings.practiceReminderTime && browserPermission === "granted") {
          // Cancel existing reminder
          if (reminderCancelRef.current) {
            reminderCancelRef.current();
          }

          // Setup new reminder
          const cancelReminder = setupReminder(
            settings.practiceReminderTime,
            "Time to practice! Let's learn some Liberian languages! 🎯"
          );
          reminderCancelRef.current = cancelReminder;

          toast.success("Study reminder scheduled!");
        } else if (reminderCancelRef.current) {
          // Cancel reminder if disabled
          reminderCancelRef.current();
          reminderCancelRef.current = null;
        }
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestBrowserPermission = async () => {
    await requestBrowserPermission();
    if (browserPermission === "granted") {
      toast.success("Browser notifications enabled!");
      // Update settings to include browser notifications
      if (settings) {
        setSettings({ ...settings, browserNotifications: true });
        setHasChanges(true);
      }
    } else if (browserPermission === "denied") {
      toast.error("Notification permission denied. Please enable it in your browser settings.");
    }
  };

  // Cleanup reminder on unmount
  useEffect(() => {
    return () => {
      if (reminderCancelRef.current) {
        reminderCancelRef.current();
      }
    };
  }, []);

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground-darkMode mb-2">Notifications</h1>
      </div>

      {/* General Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground-darkMode">General</h2>
          <span className="text-sm text-gray-500 dark:text-foreground-darkModeLight">Email</span>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="product-updates" className="text-base font-normal cursor-pointer">
              Product updates + learning tips
            </Label>
            <Switch
              id="product-updates"
              checked={settings.emailProductUpdates}
              onCheckedChange={(checked) => updateSetting("emailProductUpdates", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="new-follower" className="text-base font-normal cursor-pointer">
              New follower
            </Label>
            <Switch
              id="new-follower"
              checked={settings.emailNewFollower}
              onCheckedChange={(checked) => updateSetting("emailNewFollower", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="friend-activity" className="text-base font-normal cursor-pointer">
              Friend activity
            </Label>
            <Switch
              id="friend-activity"
              checked={settings.emailFriendActivity}
              onCheckedChange={(checked) => updateSetting("emailFriendActivity", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="weekly-progress" className="text-base font-normal cursor-pointer">
              Weekly progress
            </Label>
            <Switch
              id="weekly-progress"
              checked={settings.emailWeeklyProgress}
              onCheckedChange={(checked) => updateSetting("emailWeeklyProgress", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="special-promotions" className="text-base font-normal cursor-pointer">
              Special promotions
            </Label>
            <Switch
              id="special-promotions"
              checked={settings.emailSpecialPromotions}
              onCheckedChange={(checked) => updateSetting("emailSpecialPromotions", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="research-opportunities" className="text-base font-normal cursor-pointer">
              Research participation opportunities
            </Label>
            <Switch
              id="research-opportunities"
              checked={settings.emailResearchOpportunities}
              onCheckedChange={(checked) => updateSetting("emailResearchOpportunities", checked)}
            />
          </div>
        </div>
      </div>

      {/* Browser Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground-darkMode">Browser Notifications</h2>
          <span className="text-sm text-gray-500 dark:text-foreground-darkModeLight">Desktop & Mobile</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5" />
              Browser Notifications
            </CardTitle>
            <CardDescription>
              Receive browser notifications for study reminders (works even when app is closed)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!browserNotificationsSupported ? (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">Browser Notifications Not Supported</p>
                    <p>Your browser doesn&apos;t support browser notifications. Please use a modern browser like Chrome, Firefox, or Safari.</p>
                  </div>
                </div>
              </div>
            ) : browserPermission === "granted" ? (
              <div className="p-4 rounded-lg bg-success/10 dark:bg-success/20 border border-success dark:border-success/50">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-success mb-1">Notifications Enabled</p>
                    <p className="text-foreground-light dark:text-foreground-darkModeLight">
                      You&apos;ll receive browser notifications for study reminders.
                    </p>
                  </div>
                </div>
              </div>
            ) : browserPermission === "denied" ? (
              <div className="p-4 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive dark:border-destructive/50">
                <div className="flex items-start gap-2">
                  <BellOff className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive mb-1">Notifications Blocked</p>
                    <p className="text-foreground-light dark:text-foreground-darkModeLight mb-2">
                      Browser notifications are blocked. Please enable them in your browser settings to receive study reminders.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestBrowserPermission}
                      disabled={isRequestingPermission}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
                  Enable browser notifications to receive study reminders even when the app is closed.
                </p>
                <Button
                  onClick={handleRequestBrowserPermission}
                  disabled={isRequestingPermission}
                  className="gap-2"
                >
                  <Bell className="h-4 w-4" />
                  {isRequestingPermission ? "Requesting..." : "Enable Browser Notifications"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Reminders */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground-darkMode">Daily Reminders</h2>
          <span className="text-sm text-gray-500 dark:text-foreground-darkModeLight">Email & Browser</span>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                Study Reminder
              </CardTitle>
              <CardDescription>
                Get reminded to practice daily at your preferred time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <Label htmlFor="practice-reminder" className="text-base font-normal cursor-pointer">
                    Enable Study Reminders
                  </Label>
                  <p className="text-xs text-foreground-light dark:text-foreground-darkModeLight mt-1">
                    Receive email and browser notifications to practice
                  </p>
                </div>
                <Switch
                  id="practice-reminder"
                  checked={settings.emailPracticeReminder}
                  onCheckedChange={(checked) => updateSetting("emailPracticeReminder", checked)}
                />
              </div>

              {settings.emailPracticeReminder && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <Label htmlFor="reminder-time" className="text-sm font-medium">
                    Reminder Time
                  </Label>
                  <Select
                    value={settings.practiceReminderTime || "5:00 PM"}
                    onValueChange={(value) => updateSetting("practiceReminderTime", value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-foreground-light dark:text-foreground-darkModeLight">
                    {browserPermission === "granted" ? (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Browser notifications will be sent at this time
                      </span>
                    ) : (
                      <span className="text-foreground-light dark:text-foreground-darkModeLight">
                        Enable browser notifications above to receive browser reminders
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="pt-6 border-t border-gray-200 dark:border-border-darkMode">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-liberian-blue hover:bg-liberian-blue/90 text-white"
          >
            {isSaving ? "Saving..." : "SAVE CHANGES"}
          </Button>
        </div>
      )}
    </div>
  );
}



