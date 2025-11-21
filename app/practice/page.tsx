"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Target, BookOpen, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Heart } from "lucide-react";
import { MatchPairs } from "@/components/exercises/match-pairs";
import { DragDrop } from "@/components/exercises/drag-drop";
import { SelectMissing } from "@/components/exercises/select-missing";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

interface Exercise {
  id: string;
  type: string;
  question: string;
  correctAnswer: string;
  xpReward: number;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  lessonTitle: string;
  lessonId: string;
}

export default function PracticePage() {
  const { status } = useSession();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hearts, setHearts] = useState(5);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchReviewExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/practice/review?limit=10");
      if (!response.ok) {
        throw new Error("Failed to fetch review exercises");
      }
      const data = await response.json();
      const exerciseList = data.exercises || [];
      setExercises(exerciseList);
      setScore({ correct: 0, total: exerciseList.length });
      
      if (exerciseList.length === 0) {
        setSessionStarted(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching review exercises:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startPracticeSession = async () => {
    await fetchReviewExercises();
    setSessionStarted(true);
  };

  const handleSubmitAnswer = async () => {
    if (!exercises.length) return;

    const currentExercise = exercises[currentExerciseIndex];
    const correct = userAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase().trim();

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
    }

    // Track exercise completion
    try {
      const response = await fetch(`/api/exercises/${currentExercise.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect: correct }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.heartsRemaining !== undefined) {
          setHearts(data.heartsRemaining);
        }
      }
    } catch (error) {
      console.error("Error tracking exercise:", error);
    }
  };

  const handleExerciseComplete = async (isCorrect: boolean) => {
    if (!exercises.length) return;

    const currentExercise = exercises[currentExerciseIndex];
    setIsCorrect(isCorrect);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
    }

    // Track exercise completion
    try {
      const response = await fetch(`/api/exercises/${currentExercise.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.heartsRemaining !== undefined) {
          setHearts(data.heartsRemaining);
        }
      }
    } catch (error) {
      console.error("Error tracking exercise:", error);
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      // Session completed
      finishPracticeSession();
    }
  };

  const finishPracticeSession = () => {
    setSessionStarted(false);
    setCurrentExerciseIndex(0);
    setExercises([]);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(null);
    setScore({ correct: 0, total: 0 });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-foreground-light">Loading practice exercises...</p>
        </div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Practice Mode 🎯
            </h1>
            <p className="text-lg text-foreground-light">
              Review vocabulary and practice your skills with exercises from lessons you&apos;ve completed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Review Exercises
                </CardTitle>
                <CardDescription>
                  Practice exercises from lessons you struggled with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={startPracticeSession} className="w-full">
                  Start Review Session
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  Vocabulary Review
                </CardTitle>
                <CardDescription>
                  Review words you&apos;ve learned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  Flashcards
                </CardTitle>
                <CardDescription>
                  Review with spaced repetition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/practice/flashcards" className="block">
                  <Button variant="outline" className="w-full">
                    Start Flashcard Review
                  </Button>
                </Link>
                <p className="text-xs text-foreground-light mt-2">
                  Uses your selected language
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <ErrorMessage
            title="Unable to load practice exercises"
            message={error}
            onRetry={fetchReviewExercises}
          />
        </div>
      </div>
    );
  }

  if (sessionStarted && exercises.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-foreground-light" />
              <h2 className="text-2xl font-bold mb-2 text-foreground">No Review Exercises Available</h2>
              <p className="text-foreground-light mb-6">
                Complete some lessons first to unlock review exercises! Review exercises are generated from lessons where you had lower accuracy.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/learn">
                  <Button>Browse Languages</Button>
                </Link>
                <Button variant="outline" onClick={() => setSessionStarted(false)}>
                  Back to Practice Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-primary">
              Practice Session 🎯
            </h1>
            <div className="flex items-center gap-4">
              {/* Hearts */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(0, Math.min(5, hearts)) }).map((_, i) => (
                  <Heart key={i} className="h-6 w-6 text-destructive fill-destructive" />
                ))}
                {hearts === 0 && (
                  <span className="text-sm text-destructive font-medium ml-2">No hearts left!</span>
                )}
              </div>
              {/* Score */}
              <div className="text-right">
                <div className="text-sm text-foreground-light">
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </div>
                <div className="text-lg font-bold text-secondary">
                  {score.correct} / {score.total}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar value={progress} variant="default" className="mb-6" />
        </div>

        {/* Exercise Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">
                {currentExercise.type.replace("_", " ")}
              </CardTitle>
              <span className="text-sm text-foreground-light">
                From: {currentExercise.lessonTitle}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="text-xl font-semibold text-foreground">
              {currentExercise.question}
            </div>

            {/* Exercise Type Specific UI */}
            {currentExercise.type === "multiple_choice" && currentExercise.options && (
              <div className="space-y-3">
                {currentExercise.options.map((option) => (
                  <Button
                    key={option.id}
                    variant={
                      isAnswered && option.isCorrect
                        ? "default"
                        : isAnswered &&
                          userAnswer === option.id &&
                          !option.isCorrect
                        ? "destructive"
                        : "outline"
                    }
                    className="w-full justify-start text-left h-auto py-4 px-4"
                    onClick={() => {
                      if (!isAnswered) {
                        setUserAnswer(option.id);
                      }
                    }}
                    disabled={isAnswered || hearts === 0}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}

            {currentExercise.type === "translation" && (
              <div className="space-y-3">
                <Input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={isAnswered || hearts === 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isAnswered && userAnswer && hearts > 0) {
                      handleSubmitAnswer();
                    }
                  }}
                />
                {isAnswered && (
                  <div className="p-3 rounded-lg bg-background-dark border border-border">
                    <div className="font-semibold text-foreground">Correct answer:</div>
                    <div className="text-foreground-light">{currentExercise.correctAnswer}</div>
                  </div>
                )}
              </div>
            )}

            {currentExercise.type === "match_pairs" && currentExercise.options && (
              <MatchPairs
                question={currentExercise.question}
                pairs={currentExercise.options.map((opt) => ({
                  id: opt.id,
                  left: opt.text,
                  right: opt.text,
                }))}
                correctPairs={[currentExercise.correctAnswer]}
                onMatch={handleExerciseComplete}
                disabled={isAnswered || hearts === 0}
              />
            )}

            {currentExercise.type === "drag_drop" && (
              <DragDrop
                question={currentExercise.question}
                words={currentExercise.correctAnswer.split(" ")}
                correctOrder={currentExercise.correctAnswer.split(" ")}
                onComplete={handleExerciseComplete}
                disabled={isAnswered || hearts === 0}
              />
            )}

            {currentExercise.type === "select_missing" && currentExercise.options && (
              <SelectMissing
                question={currentExercise.question}
                sentence={currentExercise.question}
                options={currentExercise.options.map((opt) => opt.text)}
                correctAnswer={currentExercise.correctAnswer}
                onSelect={handleExerciseComplete}
                disabled={isAnswered || hearts === 0}
              />
            )}

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
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
                <div>
                  {isCorrect
                    ? `Correct! +${currentExercise.xpReward} XP`
                    : "Not quite. Keep practicing!"}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isAnswered ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer || hearts === 0}
                  className="flex-1"
                >
                  Check Answer
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {isLastExercise ? "Finish Session" : "Continue"}
                  </Button>
                  <Button
                    onClick={finishPracticeSession}
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Complete Modal */}
        {isAnswered && isLastExercise && (
          <Card className="max-w-md mx-auto mt-6 border-success">
            <CardContent className="p-6 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-success" />
              <h2 className="text-2xl font-bold mb-2">Practice Session Complete!</h2>
              <p className="text-foreground-light mb-4">
                Score: {score.correct} / {score.total} correct
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={finishPracticeSession}>
                  Back to Dashboard
                </Button>
                <Button onClick={startPracticeSession} variant="outline">
                  Practice More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
