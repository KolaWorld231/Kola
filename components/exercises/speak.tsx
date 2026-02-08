"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { Mic, MicOff, CheckCircle2, XCircle, Volume2, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculatePronunciationScore, isPronunciationAcceptable } from "@/lib/pronunciation-scorer";
import { ProgressBar } from "@/components/ui/progress-bar";
import { motion, AnimatePresence } from "framer-motion";

interface SpeakExerciseProps {
  question: string;
  correctAnswer: string;
  language?: string;
  onComplete: (isCorrect: boolean, score?: number) => void;
  disabled?: boolean;
  showScoring?: boolean; // Enable detailed pronunciation scoring
  audioUrl?: string; // Audio file to play as reference
  phonetic?: string; // Phonetic transcription
}

export function SpeakExercise({
  question,
  correctAnswer,
  language = "en-US",
  onComplete,
  disabled = false,
  showScoring = true,
  audioUrl,
  phonetic,
}: SpeakExerciseProps) {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<"excellent" | "good" | "fair" | "poor" | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [attempts, setAttempts] = useState(0);

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
    if (hasAnswered || disabled || !userTranscript.trim()) return;

    setAttempts((prev) => prev + 1);

    if (showScoring) {
      // Use pronunciation scoring
      const scoring = calculatePronunciationScore(userTranscript, correctAnswer, 70);
      setPronunciationScore(scoring.score);
      setAccuracy(scoring.accuracy);
      setFeedback(scoring.feedback);
      setIsCorrect(scoring.isCorrect);
      setHasAnswered(true);
      stopListening();

      // Call onComplete with score
      setTimeout(() => {
        onComplete(scoring.isCorrect, scoring.score);
      }, 2000);
    } else {
      // Simple binary check (legacy mode)
      const normalizedUser = userTranscript.trim().toLowerCase();
      const normalizedCorrect = correctAnswer.trim().toLowerCase();
      const exactMatch = normalizedUser === normalizedCorrect;
      const containsCorrect = normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser);
      const isCorrectAnswer = exactMatch || containsCorrect;

      setIsCorrect(isCorrectAnswer);
      setHasAnswered(true);
      stopListening();

      setTimeout(() => {
        onComplete(isCorrectAnswer);
      }, 1500);
    }
  };

  const playReferenceAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-foreground-light dark:text-foreground-darkModeLight mb-2">
              Click the microphone button and say the phrase out loud. Speak clearly
              and at a normal pace.
            </p>
            {phonetic && (
              <p className="text-xs text-foreground-light dark:text-foreground-darkModeLight italic">
                Phonetic: {phonetic}
              </p>
            )}
          </div>
          {audioUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={playReferenceAudio}
              className="shrink-0"
              aria-label="Play reference audio"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Listen
            </Button>
          )}
        </div>
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
        <AnimatePresence>
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "p-5 rounded-xl border-2 transition-all",
                isCorrect
                  ? "bg-success/10 dark:bg-success/20 border-success dark:border-success/50"
                  : "bg-destructive/10 dark:bg-destructive/20 border-destructive dark:border-destructive/50"
              )}
            >
              <div className="flex items-start gap-4">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive shrink-0 mt-1" />
                )}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-semibold text-lg">
                      {feedback || (isCorrect ? "Great pronunciation!" : "Not quite right")}
                    </p>
                  </div>

                  {/* Pronunciation Score */}
                  {showScoring && pronunciationScore !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground-light dark:text-foreground-darkModeLight">
                          Pronunciation Score
                        </span>
                        <span className={cn(
                          "text-lg font-bold",
                          pronunciationScore >= 90
                            ? "text-success"
                            : pronunciationScore >= 75
                            ? "text-primary"
                            : pronunciationScore >= 70
                            ? "text-warning"
                            : "text-destructive"
                        )}>
                          {pronunciationScore}%
                        </span>
                      </div>
                      <ProgressBar
                        value={pronunciationScore}
                        variant={
                          pronunciationScore >= 90
                            ? "success"
                            : pronunciationScore >= 75
                            ? "default"
                            : pronunciationScore >= 70
                            ? "warning"
                            : "destructive"
                        }
                        className="h-2"
                      />
                      {accuracy && (
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className={cn(
                            "h-4 w-4",
                            accuracy === "excellent" || accuracy === "good"
                              ? "text-success"
                              : "text-warning"
                          )} />
                          <span className="capitalize text-foreground-light dark:text-foreground-darkModeLight">
                            {accuracy} accuracy
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isCorrect && (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-semibold mb-1">Correct answer:</p>
                          <p className="font-bold text-base">{correctAnswer}</p>
                          {attempts < 2 && (
                            <p className="mt-2 text-xs">
                              {attempts === 1 ? "You can try again!" : "Listen and try again."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

