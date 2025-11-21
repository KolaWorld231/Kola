"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";

interface LanguageToggleProps {
  languageId: string;
  languageName: string;
  isActive: boolean;
  onToggle?: (isActive: boolean) => void;
}

export function LanguageToggle({
  languageId,
  languageName,
  isActive: initialIsActive,
  onToggle,
}: LanguageToggleProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newStatus = !isActive;

    try {
      const response = await fetch(`/api/admin/languages/${languageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update language status");
      }

      const result = await response.json();
      setIsActive(newStatus);
      
      // Call callback if provided
      if (onToggle) {
        onToggle(newStatus);
      }

      toast.success(
        result.message || `Language ${newStatus ? "activated" : "deactivated"}`,
        {
          description: `${languageName} is now ${newStatus ? "active" : "inactive"}`,
        }
      );
    } catch (error) {
      console.error("Error toggling language status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update language status",
        {
          description: `Could not ${newStatus ? "activate" : "deactivate"} ${languageName}`,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : isActive ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-gray-400" />
        )}
        <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-400"}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        aria-label={`${isActive ? "Deactivate" : "Activate"} ${languageName}`}
      />
    </div>
  );
}

