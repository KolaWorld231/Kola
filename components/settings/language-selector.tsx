"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flagEmoji?: string | null;
}

interface LanguageSelectorProps {
  currentLanguageId: string | null;
  languages: Language[];
}

export function LanguageSelector({
  currentLanguageId,
  languages,
}: LanguageSelectorProps) {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>(
    currentLanguageId || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!selectedLanguageId || selectedLanguageId === currentLanguageId) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/user/language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId: selectedLanguageId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update language");
      }

      setSuccess(true);
      // Refresh the page to show updated language
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selectedLanguageId !== currentLanguageId;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="language">Learning Language</Label>
        <p className="text-sm text-foreground-light mt-1 mb-3">
          Choose which Liberian language you want to learn. This will set your
          default language for lessons and practice.
        </p>
        <select
          id="language"
          value={selectedLanguageId}
          onChange={(e) => setSelectedLanguageId(e.target.value)}
          disabled={isSaving}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a language</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.flagEmoji || "🏳️"} {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          Language updated successfully!
        </div>
      )}

      {hasChanges && (
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Language Preference"}
        </Button>
      )}
    </div>
  );
}

