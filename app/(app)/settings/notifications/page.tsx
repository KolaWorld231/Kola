"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

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
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

      {/* Daily Reminders */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground-darkMode">Daily reminders</h2>
          <span className="text-sm text-gray-500 dark:text-foreground-darkModeLight">Email</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="practice-reminder" className="text-base font-normal cursor-pointer">
                Practice reminder
              </Label>
              <Switch
                id="practice-reminder"
                checked={settings.emailPracticeReminder}
                onCheckedChange={(checked) => updateSetting("emailPracticeReminder", checked)}
              />
            </div>

            {settings.emailPracticeReminder && (
              <div className="pl-4">
                <Select
                  value={settings.practiceReminderTime || "5:00 PM"}
                  onValueChange={(value) => updateSetting("practiceReminderTime", value)}
                >
                  <SelectTrigger className="w-32">
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
              </div>
            )}
          </div>
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



