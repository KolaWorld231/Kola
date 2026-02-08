"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import Link from "next/link";
import { ArrowLeft, RotateCcw, BookOpen } from "lucide-react";
import { Flashcard } from "@/components/exercises/flashcard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  stats?: {
    vocabularyId: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
  };
}

function FlashcardsContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const languageId = searchParams.get("languageId");
  const languageCode = searchParams.get("languageCode");

  const [flashcards, setFlashcards] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (languageId) params.append("languageId", languageId);
      if (languageCode) params.append("languageCode", languageCode);
      params.append("limit", "20");
      
      const response = await fetch(`/api/flashcards/review?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data = await response.json();
      const flashcardList = data.flashcards || [];
      
      if (flashcardList.length === 0) {
        setError("No flashcards available for this language");
      } else {
        setFlashcards(flashcardList);
        setSessionStarted(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [languageId, languageCode]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFlashcards();
    }
  }, [status, fetchFlashcards]);

  const handleAnswer = async (knowsIt: boolean, quality?: number) => {
    const currentFlashcard = flashcards[currentIndex];
    if (!currentFlashcard) return;

    setReviewed((prev) => prev + 1);
    // Consider quality > 0 as "correct" (again=0 is incorrect)
    const isCorrect = quality !== undefined ? quality > 0 : knowsIt;
    if (isCorrect) {
      setCorrect((prev) => prev + 1);
    }

    // Update flashcard progress
    try {
      const body: { vocabularyId: string; knowsIt?: boolean; quality?: number } = {
        vocabularyId: currentFlashcard.id,
      };
      
      // Prefer quality if provided, otherwise use knowsIt
      if (quality !== undefined) {
        body.quality = quality;
      } else {
        body.knowsIt = knowsIt;
      }

      const response = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.xpEarned) {
          setTotalXP((prev) => prev + data.xpEarned);
        }
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }

    // Move to next flashcard after a delay
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Session complete
        finishSession();
      }
    }, 2000);
  };

  const finishSession = () => {
    setSessionStarted(false);
    setCurrentIndex(0);
    setReviewed(0);
    setCorrect(0);
    setTotalXP(0);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-foreground-light">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/practice">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
          <ErrorMessage
            title="Unable to load flashcards"
            message={error}
            onRetry={languageId ? fetchFlashcards : undefined}
          />
        </div>
      </div>
    );
  }

  if (!sessionStarted || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/practice">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-foreground-light" />
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                No Flashcards Available
              </h2>
              <p className="text-foreground-light mb-6">
                Vocabulary for this language hasn&apos;t been added yet.
              </p>
              <Link href="/practice">
                <Button>Back to Practice</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const isComplete = currentIndex >= flashcards.length - 1 && reviewed === flashcards.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/practice">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-primary">
              Flashcards 📚
            </h1>
            <div className="text-right">
              <div className="text-sm text-foreground-light">
                Card {Math.min(currentIndex + 1, flashcards.length)} of {flashcards.length}
              </div>
              <div className="text-lg font-bold text-secondary">
                {correct} / {reviewed} correct
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar value={progress} variant="default" className="mb-6" />
        </div>

        {/* Flashcard */}
        <div className="max-w-md mx-auto">
          {currentFlashcard && (
            <Flashcard
              word={currentFlashcard.word}
              translation={currentFlashcard.translation}
              phonetic={currentFlashcard.phonetic || undefined}
              audioUrl={currentFlashcard.audioUrl || undefined}
              imageUrl={currentFlashcard.imageUrl || undefined}
              onAnswer={handleAnswer}
              disabled={false}
              useQualityRating={true}
            />
          )}
        </div>

        {/* Session Complete */}
        {isComplete && (
          <Card className="max-w-md mx-auto mt-8 border-success">
            <CardHeader>
              <CardTitle className="text-center text-success">
                Session Complete! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {correct} / {reviewed}
                </div>
                <div className="text-foreground-light">
                  {totalXP > 0 && `+${totalXP} XP earned`}
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={finishSession} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Review More
                </Button>
                <Link href="/practice">
                  <Button>Back to Practice</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" className="mx-auto" />
      </div>
    }>
      <FlashcardsContent />
    </Suspense>
  );
}

