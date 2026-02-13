"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Language {
  id: string;
  code: string;
  name: string;
}

interface CreateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultLanguageId?: string;
  languages: Language[];
}

export function CreateUnitModal({
  isOpen,
  onClose,
  onSuccess,
  defaultLanguageId,
  languages,
}: CreateUnitModalProps) {
  const [languageId, setLanguageId] = useState(defaultLanguageId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // E2E instrumentation: log mount and visibility for Playwright/debugging
  useEffect(() => {
    try {
      console.log('[e2e] CreateUnitModal mounted', { defaultLanguageId, languagesCount: languages?.length ?? 0 });
    } catch (e) {
      console.log('[e2e] CreateUnitModal mounted');
    }
  }, []);

  useEffect(() => {
    console.log(`[e2e] CreateUnitModal isOpen=${isOpen}`);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/content/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageId,
          title,
          description: description || null,
          difficulty,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to create unit");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setDifficulty("beginner");
      setLanguageId(defaultLanguageId || "");

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create unit";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Unit"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="create-unit-modal">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1">
            Language *
          </label>
          <select
            id="language"
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            required
            disabled={!!defaultLanguageId}
          >
            <option value="">Select a language</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Greetings and Basics"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this unit"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
            Difficulty *
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            required
            disabled={isSubmitting}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Unit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

