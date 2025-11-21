"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Language {
  id: string;
  code: string;
  name: string;
  units: Unit[];
}

interface Unit {
  id: string;
  title: string;
  languageId: string;
}

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultUnitId?: string;
  languages: Language[];
}

export function CreateLessonModal({
  isOpen,
  onClose,
  onSuccess,
  defaultUnitId,
  languages,
}: CreateLessonModalProps) {
  const [unitId, setUnitId] = useState(defaultUnitId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("practice");
  const [xpReward, setXpReward] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableUnits = languages.flatMap((lang) => lang.units);

  useEffect(() => {
    if (defaultUnitId) {
      setUnitId(defaultUnitId);
    }
  }, [defaultUnitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/content/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          title,
          description: description || null,
          type,
          xpReward,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to create lesson");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setType("practice");
      setXpReward(10);
      setUnitId(defaultUnitId || "");

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create lesson";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Lesson"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="unit" className="block text-sm font-medium mb-1">
            Unit *
          </label>
          <select
            id="unit"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            required
            disabled={!!defaultUnitId}
          >
            <option value="">Select a unit</option>
            {availableUnits.map((unit) => {
              const language = languages.find((l) =>
                l.units.some((u) => u.id === unit.id)
              );
              return (
                <option key={unit.id} value={unit.id}>
                  {language?.name}: {unit.title}
                </option>
              );
            })}
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
            placeholder="e.g., Basic Greetings"
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
            placeholder={
              type === "story"
                ? "Enter the story text here. Use double line breaks (\\n\\n) to separate paragraphs..."
                : "Brief description of this lesson"
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[80px]"
            disabled={isSubmitting}
          />
          {type === "story" && (
            <p className="text-xs text-foreground-light mt-1">
              For story lessons, enter the full story content here. It will be displayed before the comprehension questions.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Type *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              required
              disabled={isSubmitting}
            >
              <option value="practice">Practice</option>
              <option value="story">Story</option>
              <option value="grammar">Grammar</option>
            </select>
          </div>

          <div>
            <label htmlFor="xpReward" className="block text-sm font-medium mb-1">
              XP Reward *
            </label>
            <Input
              id="xpReward"
              type="number"
              min="1"
              max="100"
              value={xpReward}
              onChange={(e) => setXpReward(parseInt(e.target.value) || 10)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Lesson"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

