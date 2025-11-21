"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectMissingProps {
  question: string;
  sentence: string;
  missingPosition?: number; // Index where the word is missing
  options: string[];
  correctAnswer: string;
  onSelect: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function SelectMissing({
  question,
  sentence,
  options,
  correctAnswer,
  onSelect,
  disabled,
}: SelectMissingProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const sentenceParts = sentence.split("___");

  const handleSelect = (option: string) => {
    if (disabled || isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || disabled || isAnswered) return;
    
    const correct = selectedOption.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setIsAnswered(true);
    onSelect(correct);
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium text-foreground dark:text-foreground-darkMode">{question}</p>

      {/* Sentence with missing word */}
      <div className="p-6 rounded-lg bg-background-dark dark:bg-background-darkModeSecondary border-2 border-border dark:border-border-darkMode">
        <p className="text-xl font-medium text-center leading-relaxed text-foreground dark:text-foreground-darkMode">
          {sentenceParts[0]}
          <span
            className={cn(
              "inline-block min-w-[120px] px-3 py-2 mx-1 rounded border-2 border-dashed",
              selectedOption && !isAnswered && "border-primary bg-primary/5",
              isAnswered && isCorrect && "border-success bg-success/10 text-success",
              isAnswered && !isCorrect && "border-destructive bg-destructive/10 text-destructive"
            )}
          >
            {selectedOption || "______"}
          </span>
          {sentenceParts[1]}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selectedOption === option;
          const showCorrect = isAnswered && option === correctAnswer;
          const showIncorrect = isAnswered && isSelected && !isCorrect;

          return (
            <Button
              key={option}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto py-4 px-6 justify-start text-left text-lg font-bold",
                showCorrect && "bg-success border-success hover:bg-success",
                showIncorrect && "bg-destructive border-destructive hover:bg-destructive"
              )}
              onClick={() => handleSelect(option)}
              disabled={disabled || isAnswered}
              aria-label={`Select ${option}${showCorrect ? ' - Correct answer' : showIncorrect ? ' - Incorrect' : ''}`}
            >
              <span className="flex-1">{option}</span>
              {showCorrect && <CheckCircle2 className="h-5 w-5 ml-2" />}
              {showIncorrect && <XCircle className="h-5 w-5 ml-2" />}
            </Button>
          );
        })}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div
          className={cn(
            "p-4 rounded-lg flex items-center gap-3",
            isCorrect
              ? "bg-success/10 border border-success text-success"
              : "bg-destructive/10 border border-destructive text-destructive"
          )}
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Correct! The word is "{correctAnswer}"</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Not quite. The correct answer is "{correctAnswer}"</span>
            </>
          )}
        </div>
      )}

      {/* Submit button */}
      {!isAnswered && (
        <Button
          onClick={handleSubmit}
          disabled={disabled || !selectedOption}
          className="w-full"
        >
          Check Answer
        </Button>
      )}
    </div>
  );
}

