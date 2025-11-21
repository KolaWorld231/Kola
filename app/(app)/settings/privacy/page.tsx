"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserSettings {
  id: string;
  profilePublic: boolean;
  personalizedAds: boolean;
  friendStreaks: boolean;
}

export default function PrivacyPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  const updateSetting = (key: keyof UserSettings, value: boolean) => {
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground-darkMode mb-2">Privacy settings</h1>
      </div>

      {/* Privacy Options */}
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-start justify-between py-2">
          <div className="flex-1">
            <Label htmlFor="profile-public" className="text-base font-medium cursor-pointer block mb-1">
              Make my profile public
            </Label>
            <p className="text-sm text-gray-600 dark:text-foreground-darkModeLight">
              Allow others to find your profile and follow you. Allows you to follow others. Enrolls you in public leaderboards.
            </p>
          </div>
          <Switch
            id="profile-public"
            checked={settings.profilePublic}
            onCheckedChange={(checked) => updateSetting("profilePublic", checked)}
            className="ml-4"
          />
        </div>

        <div className="flex items-start justify-between py-2">
          <div className="flex-1">
            <Label htmlFor="personalized-ads" className="text-base font-medium cursor-pointer block mb-1">
              Personalized ads
            </Label>
            <p className="text-sm text-gray-600 dark:text-foreground-darkModeLight">
              Tracking and personalization for advertising
            </p>
          </div>
          <Switch
            id="personalized-ads"
            checked={settings.personalizedAds}
            onCheckedChange={(checked) => updateSetting("personalizedAds", checked)}
            className="ml-4"
          />
        </div>

        <div className="flex items-start justify-between py-2">
          <div className="flex-1">
            <Label htmlFor="friend-streaks" className="text-base font-medium cursor-pointer block mb-1">
              Friend Streaks
            </Label>
            <p className="text-sm text-gray-600 dark:text-foreground-darkModeLight">
              Share your streak milestones with friends
            </p>
          </div>
          <Switch
            id="friend-streaks"
            checked={settings.friendStreaks}
            onCheckedChange={(checked) => updateSetting("friendStreaks", checked)}
            className="ml-4"
          />
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="pt-6 border-t border-gray-200 dark:border-border-darkMode">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "h-12 text-base font-semibold",
              hasChanges
                ? "bg-liberian-blue hover:bg-liberian-blue/90 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-foreground-darkModeLight cursor-not-allowed"
            )}
          >
            {isSaving ? "Saving..." : "SAVE CHANGES"}
          </Button>
        </div>
      )}
    </div>
  );
}



