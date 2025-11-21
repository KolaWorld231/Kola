"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";

interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  difficulty: string;
  languageId: string;
}

interface Language {
  id: string;
  code: string;
  name: string;
}

interface CreateVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vocabulary?: Vocabulary | null;
  languages: Language[];
}

export function CreateVocabularyModal({
  isOpen,
  onClose,
  onSuccess,
  vocabulary,
  languages,
}: CreateVocabularyModalProps) {
  const [formData, setFormData] = useState({
    languageId: "",
    word: "",
    translation: "",
    phonetic: "",
    audioUrl: "",
    imageUrl: "",
    category: "",
    difficulty: "easy",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vocabulary) {
      setFormData({
        languageId: vocabulary.languageId,
        word: vocabulary.word,
        translation: vocabulary.translation,
        phonetic: vocabulary.phonetic || "",
        audioUrl: vocabulary.audioUrl || "",
        imageUrl: vocabulary.imageUrl || "",
        category: vocabulary.category || "",
        difficulty: vocabulary.difficulty,
      });
    } else {
      setFormData({
        languageId: languages[0]?.id || "",
        word: "",
        translation: "",
        phonetic: "",
        audioUrl: "",
        imageUrl: "",
        category: "",
        difficulty: "easy",
      });
    }
    setError(null);
  }, [vocabulary, languages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const url = vocabulary
        ? `/api/admin/vocabulary/${vocabulary.id}`
        : "/api/admin/vocabulary";
      const method = vocabulary ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phonetic: formData.phonetic || undefined,
          audioUrl: formData.audioUrl || undefined,
          imageUrl: formData.imageUrl || undefined,
          category: formData.category || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to save vocabulary");
      }

      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error saving vocabulary:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const categoryOptions = [
    { value: "basic", label: "Basic" },
    { value: "greetings", label: "Greetings" },
    { value: "food", label: "Food" },
    { value: "animals", label: "Animals" },
    { value: "family", label: "Family" },
    { value: "numbers", label: "Numbers" },
    { value: "colors", label: "Colors" },
    { value: "verbs", label: "Verbs" },
    { value: "nouns", label: "Nouns" },
    { value: "adjectives", label: "Adjectives" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vocabulary ? "Edit Vocabulary" : "Create Vocabulary"}
      description={
        vocabulary
          ? "Update the vocabulary item details"
          : "Add a new vocabulary word to the system"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="languageId">Language *</Label>
            <select
              id="languageId"
              value={formData.languageId}
              onChange={(e) =>
                setFormData({ ...formData, languageId: e.target.value })
              }
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a language</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a category</option>
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Word */}
        <div className="space-y-2">
          <Label htmlFor="word">Word (in target language) *</Label>
          <Input
            id="word"
            value={formData.word}
            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
            placeholder="Enter the word in the target language"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Translation */}
        <div className="space-y-2">
          <Label htmlFor="translation">Translation (English) *</Label>
          <Input
            id="translation"
            value={formData.translation}
            onChange={(e) =>
              setFormData({ ...formData, translation: e.target.value })
            }
            placeholder="Enter the English translation"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Phonetic */}
        <div className="space-y-2">
          <Label htmlFor="phonetic">Phonetic</Label>
          <Input
            id="phonetic"
            value={formData.phonetic}
            onChange={(e) =>
              setFormData({ ...formData, phonetic: e.target.value })
            }
            placeholder="IPA phonetic notation (e.g., /wɔlə/)"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Audio URL */}
          <div className="space-y-2">
            <FileUpload
              label="Audio"
              value={formData.audioUrl}
              onChange={(url) =>
                setFormData({ ...formData, audioUrl: url })
              }
              type="audio"
              prefix={formData.word.toLowerCase().replace(/\s+/g, "-") || "vocab"}
              disabled={isSubmitting}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <FileUpload
              label="Image"
              value={formData.imageUrl}
              onChange={(url) =>
                setFormData({ ...formData, imageUrl: url })
              }
              type="image"
              prefix={formData.word.toLowerCase().replace(/\s+/g, "-") || "vocab"}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            disabled={isSubmitting}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {difficultyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : vocabulary
              ? "Update Vocabulary"
              : "Create Vocabulary"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

