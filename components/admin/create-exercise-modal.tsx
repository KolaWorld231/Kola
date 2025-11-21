"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

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
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  unitId: string;
}

interface ExerciseOption {
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  isCorrect: boolean;
}

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultLessonId?: string;
  languages: Language[];
}

const EXERCISE_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "translation", label: "Translation" },
  { value: "match_pairs", label: "Match Pairs" },
  { value: "drag_drop", label: "Drag & Drop" },
  { value: "select_missing", label: "Select Missing" },
  { value: "listen_choose", label: "Listen & Choose" },
  { value: "speak", label: "Speak" },
  { value: "flashcard", label: "Flashcard" },
];

export function CreateExerciseModal({
  isOpen,
  onClose,
  onSuccess,
  defaultLessonId,
  languages,
}: CreateExerciseModalProps) {
  const [lessonId, setLessonId] = useState(defaultLessonId || "");
  const [type, setType] = useState("multiple_choice");
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionAudio, setQuestionAudio] = useState("");
  const [questionImage, setQuestionImage] = useState("");
  const [grammarTip, setGrammarTip] = useState("");
  const [xpReward, setXpReward] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const [options, setOptions] = useState<ExerciseOption[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableLessons = languages.flatMap((lang) =>
    lang.units.flatMap((unit) => unit.lessons)
  );

  useEffect(() => {
    if (defaultLessonId) {
      setLessonId(defaultLessonId);
    }
  }, [defaultLessonId]);

  useEffect(() => {
    // Reset options when type changes
    if (type === "multiple_choice" || type === "select_missing" || type === "listen_choose") {
      if (options.length === 0) {
        setOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof ExerciseOption, value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate based on exercise type
    if (type === "multiple_choice" || type === "select_missing" || type === "listen_choose") {
      const validOptions = options.filter((opt) => opt.text.trim() !== "");
      if (validOptions.length < 2) {
        setError("Multiple choice exercises need at least 2 options");
        return;
      }
      const hasCorrect = validOptions.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        setError("At least one option must be marked as correct");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const exerciseData: {
        lessonId: string;
        type: string;
        question: string;
        correctAnswer: string;
        xpReward: number;
        difficulty: string;
        questionAudio?: string;
        questionImage?: string;
        grammarTip?: string;
        options?: ExerciseOption[];
      } = {
        lessonId,
        type,
        question,
        correctAnswer,
        xpReward,
        difficulty,
      };

      if (questionAudio) {
        exerciseData.questionAudio = questionAudio;
      }
      if (questionImage) {
        exerciseData.questionImage = questionImage;
      }
      if (grammarTip && grammarTip.trim()) {
        exerciseData.grammarTip = grammarTip;
      }

      // Include options for multiple choice, select_missing, and listen_choose
      if (
        type === "multiple_choice" ||
        type === "select_missing" ||
        type === "listen_choose"
      ) {
        exerciseData.options = options.filter((opt) => opt.text.trim() !== "");
      }

      const response = await fetch("/api/admin/content/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exerciseData),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to create exercise");
      }

      // Reset form
      setLessonId(defaultLessonId || "");
      setType("multiple_choice");
      setQuestion("");
      setCorrectAnswer("");
      setQuestionAudio("");
      setQuestionImage("");
      setXpReward(5);
      setDifficulty("easy");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create exercise";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const needsOptions =
    type === "multiple_choice" || type === "select_missing" || type === "listen_choose";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Exercise"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lesson" className="block text-sm font-medium mb-1">
              Lesson *
            </label>
            <select
              id="lesson"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              required
              disabled={!!defaultLessonId}
            >
              <option value="">Select a lesson</option>
              {availableLessons.map((lesson) => {
                const unit = languages
                  .flatMap((l) => l.units)
                  .find((u) => u.lessons.some((l) => l.id === lesson.id));
                const language = languages.find((l) =>
                  l.units.some((u) => u.id === unit?.id)
                );
                return (
                  <option key={lesson.id} value={lesson.id}>
                    {language?.name}: {lesson.title}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Exercise Type *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              required
              disabled={isSubmitting}
            >
              {EXERCISE_TYPES.map((et) => (
                <option key={et.value} value={et.value}>
                  {et.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="question" className="block text-sm font-medium mb-1">
            Question / Word *
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question or word to display"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[80px]"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="correctAnswer" className="block text-sm font-medium mb-1">
              Correct Answer *
            </label>
            <Input
              id="correctAnswer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter the correct answer"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="xpReward" className="block text-sm font-medium mb-1">
              XP Reward *
            </label>
            <Input
              id="xpReward"
              type="number"
              min="1"
              max="20"
              value={xpReward}
              onChange={(e) => setXpReward(parseInt(e.target.value) || 5)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FileUpload
              label="Question Audio (optional)"
              value={questionAudio}
              onChange={setQuestionAudio}
              type="audio"
              prefix="exercise"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <FileUpload
              label="Question Image (optional)"
              value={questionImage}
              onChange={setQuestionImage}
              type="image"
              prefix="exercise"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="grammarTip" className="block text-sm font-medium mb-1">
            Grammar Tip (optional)
          </label>
          <textarea
            id="grammarTip"
            value={grammarTip}
            onChange={(e) => setGrammarTip(e.target.value)}
            placeholder="Add a grammar explanation or tip for this exercise..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[100px]"
            disabled={isSubmitting}
          />
          <p className="text-xs text-foreground-light mt-1">
            Provide a grammar explanation or helpful tip that will appear before this exercise.
          </p>
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
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {needsOptions && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Options *</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={isSubmitting}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Option
              </Button>
            </div>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="space-y-2 p-4 border border-border rounded-lg bg-background-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(index, "text", e.target.value)
                      }
                      placeholder={`Option ${index + 1} text`}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    <label className="flex items-center gap-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) =>
                          handleOptionChange(index, "isCorrect", e.target.checked)
                        }
                        disabled={isSubmitting}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Correct</span>
                    </label>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FileUpload
                      label="Audio (optional)"
                      value={option.audioUrl || ""}
                      onChange={(url) =>
                        handleOptionChange(index, "audioUrl", url)
                      }
                      type="audio"
                      prefix={`option-${index + 1}`}
                      disabled={isSubmitting}
                    />
                    <FileUpload
                      label="Image (optional)"
                      value={option.imageUrl || ""}
                      onChange={(url) =>
                        handleOptionChange(index, "imageUrl", url)
                      }
                      type="image"
                      prefix={`option-${index + 1}`}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground-light mt-2">
              At least 2 options required. Mark the correct answer(s).
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Exercise"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

