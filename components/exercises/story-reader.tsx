"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CheckCircle2, XCircle, Volume2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";

interface StoryQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface StoryReaderProps {
  title: string;
  content: string;
  translation?: string;
  audioUrl?: string;
  questions: StoryQuestion[];
  language?: string;
  onComplete: (correctAnswers: number, totalQuestions: number) => void;
  disabled?: boolean;
}

export function StoryReader({
  title,
  content,
  translation,
  audioUrl,
  questions,
  language = "en-US",
  onComplete,
  disabled = false,
}: StoryReaderProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis({
    lang: language,
    onEnd: () => {
      setIsPlaying(false);
    },
    onError: () => {
      setIsPlaying(false);
    },
  });

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  // Initialize audio element
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioUrl]);

  const handlePlayAudio = () => {
    if (isPlaying) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      if (isSpeaking) {
        stop();
      }
      setIsPlaying(false);
    } else {
      if (audioUrl && audioElement) {
        audioElement.play().catch(() => {
          // Fall back to text-to-speech
          if (content) {
            speak(content);
            setIsPlaying(true);
          }
        });
        setIsPlaying(true);
      } else if (content && isSupported) {
        speak(content);
        setIsPlaying(true);
      }
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleAnswer = (questionId: string, optionId: string) => {
    if (disabled || answeredQuestions.has(questionId)) return;

    setAnswers({ ...answers, [questionId]: optionId });
    setAnsweredQuestions(new Set([...answeredQuestions, questionId]));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      const correctCount = questions.filter((q) => {
        const selectedOptionId = answers[q.id];
        const selectedOption = q.options.find((o) => o.id === selectedOptionId);
        return selectedOption?.isCorrect;
      }).length;

      onComplete(correctCount, questions.length);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isCurrentQuestionAnswered =
    currentQuestion && answeredQuestions.has(currentQuestion.id);
  const selectedOptionId = currentQuestion
    ? answers[currentQuestion.id]
    : null;

  return (
    <div className="space-y-6">
      {/* Story Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-secondary" />
              {title}
            </CardTitle>
            {audioUrl || (content && isSupported) ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayAudio}
                disabled={disabled}
                className="gap-2"
              >
                <Volume2
                  className={cn(
                    "h-4 w-4",
                    isPlaying && "text-secondary animate-pulse"
                  )}
                />
                {isPlaying ? "Playing..." : "Listen"}
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Story Text */}
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed text-foreground whitespace-pre-line">
              {content}
            </p>
          </div>

          {/* Translation Toggle */}
          {translation && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-secondary hover:text-primary"
              >
                {showTranslation ? "Hide" : "Show"} Translation
              </Button>
              {showTranslation && (
                <div className="mt-2 p-3 rounded-lg bg-background-dark border border-border">
                  <p className="text-sm text-foreground-light italic">{translation}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Section */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Comprehension Questions ({currentQuestionIndex + 1} /{" "}
                {questions.length})
              </CardTitle>
              <div className="text-sm text-foreground-light">
                {answeredQuestions.size} / {questions.length} answered
              </div>
            </div>
            <ProgressBar value={progress} variant="default" className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Question */}
            {currentQuestion && (
              <div className="space-y-4">
                <p className="text-lg font-semibold text-foreground">
                  {currentQuestion.question}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    const showCorrect =
                      isCurrentQuestionAnswered && option.isCorrect;
                    const showIncorrect =
                      isCurrentQuestionAnswered &&
                      isSelected &&
                      !option.isCorrect;

                    return (
                      <Button
                        key={option.id}
                        onClick={() =>
                          handleAnswer(currentQuestion.id, option.id)
                        }
                        disabled={disabled || isCurrentQuestionAnswered}
                        variant={
                          showCorrect
                            ? "default"
                            : showIncorrect
                            ? "destructive"
                            : isSelected
                            ? "outline"
                            : "outline"
                        }
                        className={cn(
                          "w-full justify-start text-left h-auto py-3 px-4",
                          showCorrect &&
                            "bg-green-500 hover:bg-green-600 border-green-600 text-white",
                          showIncorrect &&
                            "bg-red-500 hover:bg-red-600 border-red-600 text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {isCurrentQuestionAnswered && (
                            <>
                              {showCorrect && (
                                <CheckCircle2 className="h-5 w-5" />
                              )}
                              {showIncorrect && (
                                <XCircle className="h-5 w-5" />
                              )}
                            </>
                          )}
                          <span>{option.text}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || disabled}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={
                      !isCurrentQuestionAnswered ||
                      disabled ||
                      currentQuestionIndex >= questions.length - 1
                    }
                    className="bg-secondary hover:bg-secondary-hover"
                  >
                    {currentQuestionIndex < questions.length - 1
                      ? "Next Question"
                      : "Complete Story"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

