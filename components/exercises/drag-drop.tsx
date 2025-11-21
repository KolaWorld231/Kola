"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropProps {
  question: string;
  words: string[];
  correctOrder: string[];
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function DragDrop({ question, words, correctOrder, onComplete, disabled }: DragDropProps) {
  const [order, setOrder] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const availableWords = words.filter((word) => !order.includes(word));

  const handleRemove = (index: number) => {
    if (disabled || isChecked) return;
    const newOrder = [...order];
    newOrder.splice(index, 1);
    setOrder(newOrder);
  };

  const handleAddWord = (word: string) => {
    if (disabled || isChecked || order.includes(word)) return;
    setOrder([...order, word]);
  };

  const handleCheck = () => {
    const correct = JSON.stringify(order) === JSON.stringify(correctOrder);
    setIsCorrect(correct);
    setIsChecked(true);
    onComplete(correct);
  };

  const handleReset = () => {
    setOrder([]);
    setIsChecked(false);
    setIsCorrect(null);
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium text-foreground dark:text-foreground-darkMode">{question}</p>

      {/* Drop zones */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-darkModeLight">Drag words to form the sentence:</h3>
        <div className="min-h-[120px] border-2 border-dashed border-border dark:border-border-darkMode rounded-lg p-4 bg-background-dark dark:bg-background-darkModeSecondary">
          {order.length === 0 ? (
            <div className="flex items-center justify-center h-full text-foreground-light dark:text-foreground-darkModeLight">
              Drop words here to build the sentence
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {order.map((word, index) => (
                <Card
                  key={`${word}-${index}`}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 cursor-pointer",
                    isChecked && isCorrect && "bg-success/10 border-success",
                    isChecked && !isCorrect && "bg-destructive/10 border-destructive"
                  )}
                  onClick={() => !disabled && !isChecked && handleRemove(index)}
                >
                  <GripVertical className="h-4 w-4 text-foreground-light" />
                  <span className="font-medium">{word}</span>
                  {!disabled && !isChecked && (
                    <XCircle className="h-4 w-4 text-foreground-light hover:text-destructive" />
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available words */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-darkModeLight">Available words:</h3>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word) => (
            <Button
              key={word}
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => handleAddWord(word)}
              disabled={disabled || isChecked}
            >
              {word}
            </Button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {isChecked && (
        <div className={cn(
          "p-4 rounded-lg flex items-center gap-3",
          isCorrect ? "bg-success/10 border border-success text-success" : "bg-destructive/10 border border-destructive text-destructive"
        )}>
          {isCorrect ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <div className="font-medium">Correct!</div>
                <div className="text-sm">The sentence is: {correctOrder.join(" ")}</div>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5" />
              <div>
                <div className="font-medium">Not quite right</div>
                <div className="text-sm">Correct order: {correctOrder.join(" ")}</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isChecked ? (
          <Button
            onClick={handleCheck}
            disabled={disabled || order.length === 0 || order.length !== correctOrder.length}
            className="flex-1"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

