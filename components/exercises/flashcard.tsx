"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FlashcardProps {
  word: string;
  translation: string;
  phonetic?: string;
  audioUrl?: string;
  imageUrl?: string;
  onFlip?: () => void;
  onAnswer: (knowIt: boolean, quality?: number) => void;
  disabled?: boolean;
  useQualityRating?: boolean; // Enable 4-level quality rating
}

export function Flashcard({
  word,
  translation,
  phonetic,
  audioUrl,
  imageUrl,
  onFlip,
  onAnswer,
  disabled,
  useQualityRating = false,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userKnowsIt, setUserKnowsIt] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<number | null>(null);

  const handleFlip = () => {
    if (!disabled && !isAnswered) {
      setIsFlipped(true);
      onFlip?.();
    }
  };

  const handleAnswer = (knowsIt: boolean, qualityRating?: number) => {
    if (disabled || isAnswered) return;
    
    setUserKnowsIt(knowsIt);
    setQuality(qualityRating || null);
    setIsAnswered(true);
    onAnswer(knowsIt, qualityRating);
  };

  const handleQualityAnswer = (qualityRating: number) => {
    if (disabled || isAnswered) return;
    
    const knowsIt = qualityRating > 0;
    setQuality(qualityRating);
    setUserKnowsIt(knowsIt);
    setIsAnswered(true);
    onAnswer(knowsIt, qualityRating);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setIsAnswered(false);
    setUserKnowsIt(null);
    setQuality(null);
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Flashcard */}
      <div
        className={cn(
          "relative w-full max-w-md mx-auto h-64 cursor-pointer perspective-1000",
          !isFlipped && !disabled && "hover:scale-105 transition-transform",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={!isFlipped && !disabled ? handleFlip : undefined}
      >
        <Card
          className={cn(
            "absolute inset-0 w-full h-full transition-all duration-500 preserve-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Front Side */}
          <CardContent
            className={cn(
              "absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6",
              !isFlipped ? "z-10" : "z-0"
            )}
          >
            <div className="text-center space-y-4 w-full">
              {imageUrl && (
                <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-border">
                  <Image
                    src={imageUrl}
                    alt={word}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{word}</h2>
                {phonetic && (
                  <p className="text-lg text-foreground-light italic">{phonetic}</p>
                )}
              </div>
              {audioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  disabled={disabled}
                >
                  🔊 Listen
                </Button>
              )}
              {!isFlipped && (
                <p className="text-sm text-foreground-light mt-4">
                  Tap to reveal translation
                </p>
              )}
            </div>
          </CardContent>

          {/* Back Side */}
          <CardContent
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6",
              isFlipped ? "z-10 bg-secondary/5" : "z-0"
            )}
          >
            <div className="text-center space-y-4 w-full">
              <h3 className="text-2xl font-semibold text-foreground-light mb-2">
                Translation
              </h3>
              <p className="text-3xl font-bold text-primary">{translation}</p>
              {word && (
                <p className="text-lg text-foreground-light mt-2">{word}</p>
              )}
              {phonetic && (
                <p className="text-sm text-foreground-light italic">{phonetic}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answer Buttons */}
      {isFlipped && !isAnswered && (
        <div className="flex flex-col gap-3">
          {useQualityRating ? (
            // 4-level quality rating (Anki-style)
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => handleQualityAnswer(0)}
                disabled={disabled}
                className="flex-1"
              >
                <XCircle className="mr-1 h-4 w-4" />
                <span className="text-xs sm:text-sm">Again</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleQualityAnswer(1)}
                disabled={disabled}
                className="flex-1 border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                <span className="text-xs sm:text-sm">Hard</span>
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => handleQualityAnswer(2)}
                disabled={disabled}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <span className="text-xs sm:text-sm">Good</span>
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => handleQualityAnswer(3)}
                disabled={disabled}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                <span className="text-xs sm:text-sm">Easy</span>
              </Button>
            </div>
          ) : (
            // Binary mode (legacy)
            <div className="flex gap-4 justify-center">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => handleAnswer(false)}
                disabled={disabled}
                className="flex-1 max-w-xs"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Don&apos;t Know
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => handleAnswer(true)}
                disabled={disabled}
                className="flex-1 max-w-xs"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Know It
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {isAnswered && (
        <div
          className={cn(
            "p-4 rounded-lg flex items-center justify-center gap-3",
            userKnowsIt
              ? "bg-success/10 border border-success text-success"
              : "bg-destructive/10 border border-destructive text-destructive"
          )}
        >
          {userKnowsIt ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Great! You know this word.</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Keep practicing this word!</span>
            </>
          )}
        </div>
      )}

      {/* Reset Button */}
      {isAnswered && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={disabled}
            size="sm"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Review Again
          </Button>
        </div>
      )}
    </div>
  );
}

