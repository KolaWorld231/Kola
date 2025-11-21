"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchPair {
  id: string;
  left: string;
  right: string;
}

interface MatchPairsProps {
  question: string;
  pairs: MatchPair[];
  correctPairs: string[]; // Array of pair IDs that match
  onMatch: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function MatchPairs({ question, pairs, correctPairs, onMatch, disabled }: MatchPairsProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [incorrectPairs, setIncorrectPairs] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const leftPairs = pairs.filter((p) => !matchedPairs.has(p.id));
  const rightPairs = pairs.filter((p) => !matchedPairs.has(p.id));

  const handleLeftClick = (pairId: string) => {
    if (disabled || matchedPairs.has(pairId)) return;
    
    if (selectedLeft === pairId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(pairId);
    }
    setSelectedRight(null);
  };

  const handleRightClick = (pairId: string) => {
    if (disabled || matchedPairs.has(pairId)) return;
    
    if (selectedRight === pairId) {
      setSelectedRight(null);
    } else if (selectedLeft) {
      // Check if match is correct
      const isCorrect = correctPairs.includes(`${selectedLeft}-${pairId}`) || 
                        correctPairs.includes(`${pairId}-${selectedLeft}`) ||
                        selectedLeft === pairId;

      if (isCorrect) {
        setMatchedPairs((prev) => new Set([...prev, pairId, selectedLeft]));
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all pairs matched
        if (matchedPairs.size + 2 >= pairs.length) {
          setIsComplete(true);
          onMatch(true);
        }
      } else {
        setIncorrectPairs((prev) => new Set([...prev, pairId, selectedLeft]));
        setTimeout(() => {
          setIncorrectPairs((prev) => {
            const next = new Set(prev);
            next.delete(pairId);
            next.delete(selectedLeft);
            return next;
          });
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 1000);
        onMatch(false);
      }
    } else {
      setSelectedRight(pairId);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium text-foreground dark:text-foreground-darkMode">{question}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-darkModeLight mb-3">English</h3>
          {leftPairs.map((pair) => {
            const isSelected = selectedLeft === pair.id;
            const isMatched = matchedPairs.has(pair.id);
            const isIncorrect = incorrectPairs.has(pair.id);

            return (
              <Card
                key={pair.id}
                className={cn(
                  "cursor-pointer transition-all",
                  isMatched && "opacity-50 cursor-not-allowed border-success",
                  isSelected && "ring-2 ring-primary",
                  isIncorrect && "border-destructive bg-destructive/10"
                )}
                onClick={() => handleLeftClick(pair.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <span className={cn(
                    "font-medium",
                    isMatched && "line-through"
                  )}>{pair.left}</span>
                  {isMatched && <CheckCircle2 className="h-5 w-5 text-success" />}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground-light dark:text-foreground-darkModeLight mb-3">Target Language</h3>
          {rightPairs.map((pair) => {
            const isSelected = selectedRight === pair.id;
            const isMatched = matchedPairs.has(pair.id);
            const isIncorrect = incorrectPairs.has(pair.id);

            return (
              <Card
                key={pair.id}
                className={cn(
                  "cursor-pointer transition-all",
                  isMatched && "opacity-50 cursor-not-allowed border-success",
                  isSelected && "ring-2 ring-primary",
                  isIncorrect && "border-destructive bg-destructive/10"
                )}
                onClick={() => handleRightClick(pair.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <span className={cn(
                    "font-medium",
                    isMatched && "line-through"
                  )}>{pair.right}</span>
                  {isMatched && <CheckCircle2 className="h-5 w-5 text-success" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <div className="p-4 rounded-lg bg-success/10 border border-success text-success flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">All pairs matched correctly!</span>
        </div>
      )}
    </div>
  );
}

