"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { Mic, MicOff, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakExerciseProps {
  question: string;
  correctAnswer: string;
  language?: string;
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function SpeakExercise({
  question,
  correctAnswer,
  language = "en-US",
  onComplete,
  disabled = false,
}: SpeakExerciseProps) {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    reset,
  } = useSpeechRecognition({
    lang: language,
    continuous: false,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript && !hasAnswered) {
        checkAnswer(transcript);
      }
    },
    onError: (errorMsg) => {
      console.error("Speech recognition error:", errorMsg);
    },
  });

  const checkAnswer = (userTranscript: string) => {
    if (hasAnswered || disabled) return;

    // Normalize both transcripts for comparison
    const normalizedUser = userTranscript.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    // Check for exact match or partial match
    const exactMatch = normalizedUser === normalizedCorrect;
    const containsCorrect = normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser);
    
    // For pronunciation practice, we allow some flexibility
    const isCorrectAnswer = exactMatch || containsCorrect;

    setIsCorrect(isCorrectAnswer);
    setHasAnswered(true);
    stopListening();

    // Call onComplete after a short delay to show feedback
    setTimeout(() => {
      onComplete(isCorrectAnswer);
    }, 1500);
  };

  const handleStartListening = () => {
    if (disabled || hasAnswered || !isSupported) return;
    reset();
    startListening();
  };

  const handleStopListening = () => {
    if (isListening) {
      stopListening();
      if (transcript && !hasAnswered) {
        checkAnswer(transcript);
      }
    }
  };

  // Auto-check when user stops speaking and transcript is available
  useEffect(() => {
    if (!isListening && transcript && !hasAnswered && !disabled) {
      const timeoutId = setTimeout(() => {
        checkAnswer(transcript);
      }, 1000); // Wait 1 second after stopping to check

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript, hasAnswered, disabled]);

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
        <p className="font-semibold mb-2">Speech Recognition Not Supported</p>
        <p className="text-sm">
          Your browser doesn&apos;t support speech recognition. Please use Chrome,
          Edge, or Safari for speaking exercises.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-lg font-semibold text-foreground dark:text-foreground-darkMode">{question}</div>

      {/* Instructions */}
      <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30">
        <p className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
          Click the microphone button and say the phrase out loud. Speak clearly
          and at a normal pace.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Transcript Display */}
      <div className="min-h-[60px] p-4 rounded-lg bg-background-dark dark:bg-background-darkModeSecondary border border-border dark:border-border-darkMode">
        {transcript ? (
          <p className="text-lg text-foreground dark:text-foreground-darkMode">{transcript}</p>
        ) : (
          <p className="text-sm text-foreground-light dark:text-foreground-darkModeLight italic">
            {isListening
              ? "Listening... Speak now!"
              : "Click the microphone to start speaking"}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!hasAnswered && (
          <>
            {!isListening ? (
              <Button
                onClick={handleStartListening}
                disabled={disabled || hasAnswered}
                size="lg"
                className="h-16 w-16 rounded-full"
                aria-label="Start speaking"
              >
                <Mic className="h-8 w-8" />
              </Button>
            ) : (
              <Button
                onClick={handleStopListening}
                variant="destructive"
                size="lg"
                className="h-16 w-16 rounded-full animate-pulse"
                aria-label="Stop speaking"
              >
                <MicOff className="h-8 w-8" />
              </Button>
            )}
          </>
        )}

        {/* Feedback */}
        {hasAnswered && (
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg",
              isCorrect
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
            <div>
              <p className="font-semibold">
                {isCorrect ? "Great pronunciation!" : "Not quite right"}
              </p>
              {!isCorrect && (
                <p className="text-sm mt-1">
                  Correct answer: <strong>{correctAnswer}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Correct Answer Display */}
      {hasAnswered && !isCorrect && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Correct answer:</strong> {correctAnswer}
          </p>
        </div>
      )}
    </div>
  );
}

