"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

interface UserSettings {
  id: string;
  soundEffects: boolean;
  animations: boolean;
  motivationalMessages: boolean;
  listeningExercises: boolean;
  darkMode: string;
}

export default function PreferencesPage() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
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

  const updateSetting = (key: keyof UserSettings, value: boolean | string) => {
    if (!settings) return;
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    setHasChanges(true);
    
    // Update theme immediately when dark mode setting changes
    if (key === "darkMode") {
      setTheme(value as string);
    }
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
        // Ensure theme is synced after save
        if (settings.darkMode) {
          setTheme(settings.darkMode);
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground-darkMode mb-2">Preferences</h1>
      </div>

      {/* Lesson experience section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground-darkMode mb-2">Lesson experience</h2>
          <div className="h-px bg-gray-200 dark:bg-border-darkMode mb-6" />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="sound-effects" className="text-base font-normal cursor-pointer">
              Sound effects
            </Label>
            <Switch
              id="sound-effects"
              checked={settings.soundEffects}
              onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="animations" className="text-base font-normal cursor-pointer">
              Animations
            </Label>
            <Switch
              id="animations"
              checked={settings.animations}
              onCheckedChange={(checked) => updateSetting("animations", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="motivational-messages" className="text-base font-normal cursor-pointer">
              Motivational messages
            </Label>
            <Switch
              id="motivational-messages"
              checked={settings.motivationalMessages}
              onCheckedChange={(checked) => updateSetting("motivationalMessages", checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="listening-exercises" className="text-base font-normal cursor-pointer">
              Listening exercises
            </Label>
            <Switch
              id="listening-exercises"
              checked={settings.listeningExercises}
              onCheckedChange={(checked) => updateSetting("listeningExercises", checked)}
            />
          </div>
        </div>
      </div>

      {/* Appearance section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground-darkMode mb-2">Appearance</h2>
          <div className="h-px bg-gray-200 dark:bg-border-darkMode mb-6" />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="dark-mode" className="text-base font-normal cursor-pointer">
            Dark mode
          </Label>
          <Select
            value={settings.darkMode}
            onValueChange={(value) => updateSetting("darkMode", value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">SYSTEM DEFAULT</SelectItem>
              <SelectItem value="light">LIGHT</SelectItem>
              <SelectItem value="dark">DARK</SelectItem>
            </SelectContent>
          </Select>
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


