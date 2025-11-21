"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, XCircle, Heart } from "lucide-react";
import Link from "next/link";
// Lazy load heavy exercise components for code splitting
import dynamic from "next/dynamic";

const MatchPairs = dynamic(() => import("@/components/exercises/match-pairs").then(mod => ({ default: mod.MatchPairs })), {
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-64" />,
});

const DragDrop = dynamic(() => import("@/components/exercises/drag-drop").then(mod => ({ default: mod.DragDrop })), {
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-64" />,
});

const SelectMissing = dynamic(() => import("@/components/exercises/select-missing").then(mod => ({ default: mod.SelectMissing })), {
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-64" />,
});

const Flashcard = dynamic(() => import("@/components/exercises/flashcard").then(mod => ({ default: mod.Flashcard })), {
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-64" />,
});

const SpeakExercise = dynamic(() => import("@/components/exercises/speak").then(mod => ({ default: mod.SpeakExercise })), {
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-64" />,
});

const ListenChooseExercise = dynamic(() => import("@/components/exercises/listen-choose").then(mod => ({ default: mod.ListenChooseExercise })), {
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg h-64" />,
});
import { ProgressBar } from "@/components/ui/progress-bar";
import { AchievementNotification } from "@/components/achievements/achievement-notification";
import { LessonCompletion } from "@/components/lesson/lesson-completion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { LessonSkeleton } from "@/components/ui/lesson-skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { HeartRecovery } from "@/components/hearts/heart-recovery";
import { Modal } from "@/components/ui/modal";
import { StoryReader } from "@/components/exercises/story-reader";
import { GrammarTip } from "@/components/exercises/grammar-tip";

interface Exercise {
  id: string;
  type: string;
  question: string;
  questionAudio?: string;
  questionImage?: string;
  correctAnswer: string;
  grammarTip?: string | null;
  order: number;
  xpReward: number;
  options?: ExerciseOption[];
}

interface ExerciseOption {
  id: string;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  isCorrect: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type?: string;
  xpReward: number;
  exercises: Exercise[];
  unit?: {
    language?: {
      code: string;
      name: string;
    };
  };
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params?.id as string;
  const { status } = useSession();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hearts, setHearts] = useState(5);
  const [totalXP, setTotalXP] = useState(0);
  const [nextHeartRegeneration, setNextHeartRegeneration] = useState<Date | string | null>(null);
  const [timeUntilNextHeart, setTimeUntilNextHeart] = useState<number | null>(null);
  const [showHeartRecoveryModal, setShowHeartRecoveryModal] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Array<{
    id: string;
    code: string;
    name: string;
    icon?: string | null;
    xpReward: number;
  }>>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lessonCompletionData, setLessonCompletionData] = useState<{
    xpEarned: number;
    achievements: Array<{
      id: string;
      code: string;
      name: string;
      icon?: string | null;
      xpReward: number;
    }>;
  } | null>(null);
  const [hasReadStory, setHasReadStory] = useState(false);
  const [storyData, setStoryData] = useState<{
    title?: string;
    content?: string;
    translation?: string | null;
    audioUrl?: string | null;
    questions?: Array<{
      id: string;
      question: string;
      correctAnswer: string;
      options?: Array<{ id: string; text: string }>;
    }>;
  } | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [lessonResponse, userResponse] = await Promise.all([
        fetch(`/api/lessons/${lessonId}`),
        fetch(`/api/user/me`),
      ]);

      if (!lessonResponse.ok) {
        if (lessonResponse.status === 404) {
          throw new Error("Lesson not found");
        }
        throw new Error("Failed to fetch lesson");
      }

      const lessonData = await lessonResponse.json();
      setLesson(lessonData);
      setScore({ correct: 0, total: lessonData.exercises.length });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setHearts(userData.hearts || 5);
        setTotalXP(userData.totalXP || 0);
        setNextHeartRegeneration(userData.nextHeartRegeneration || null);
        if (userData.nextHeartRegeneration) {
          const nextTime = new Date(userData.nextHeartRegeneration).getTime();
          const now = new Date().getTime();
          setTimeUntilNextHeart(Math.max(0, nextTime - now));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching lesson:", err);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && lessonId) {
      fetchLesson();
    }
  }, [status, lessonId, fetchLesson, router]);

  // Fetch story data if it's a story lesson
  useEffect(() => {
    if (lesson?.type === "story" && !hasReadStory && !storyData && !loadingStory && lessonId) {
      setLoadingStory(true);
      fetch(`/api/stories/${lessonId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.story) {
            setStoryData(data.story);
          }
          setLoadingStory(false);
        })
        .catch(() => {
          setLoadingStory(false);
        });
    }
  }, [lesson, hasReadStory, storyData, loadingStory, lessonId]);

  const handleSubmitAnswer = async () => {
    if (!lesson) return;

    const currentExercise = lesson.exercises[currentExerciseIndex];
    const correct = userAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase().trim();

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    }

    // Track exercise completion and award XP
    try {
      const response = await fetch(`/api/exercises/${currentExercise.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect: correct }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.xpEarned) {
          setTotalXP((prev) => prev + data.xpEarned);
        }
        if (data.heartsLost) {
          setHearts((prev) => Math.max(0, prev - data.heartsLost));
        }
        if (data.heartsRemaining !== undefined) {
          setHearts(data.heartsRemaining);
        }
        // Show achievement notifications
        if (data.achievements && data.achievements.length > 0) {
          setUnlockedAchievements((prev) => [...prev, ...data.achievements]);
        }
      }
    } catch (error) {
      console.error("Error tracking exercise:", error);
    }
  };

  const handleExerciseComplete = async (isCorrect: boolean) => {
    if (!lesson) return;

    const currentExercise = lesson.exercises[currentExerciseIndex];
    setIsCorrect(isCorrect);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    }

    // Track exercise completion and award XP
    try {
      const response = await fetch(`/api/exercises/${currentExercise.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.xpEarned) {
          setTotalXP((prev) => prev + data.xpEarned);
        }
        if (data.heartsLost !== undefined) {
          const newHearts = Math.max(0, hearts - data.heartsLost);
          setHearts(newHearts);
          if (newHearts === 0) {
            setShowHeartRecoveryModal(true);
          }
        }
        if (data.heartsRemaining !== undefined) {
          setHearts(data.heartsRemaining);
          if (data.heartsRemaining === 0) {
            setShowHeartRecoveryModal(true);
          }
        }
        // Show achievement notifications
        if (data.achievements && data.achievements.length > 0) {
          setUnlockedAchievements((prev) => [...prev, ...data.achievements]);
        }
      }
    } catch (error) {
      console.error("Error tracking exercise:", error);
    }
  };

  const fetchUserHearts = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const userData = await response.json();
        setHearts(userData.hearts || 5);
        setNextHeartRegeneration(userData.nextHeartRegeneration || null);
        if (userData.nextHeartRegeneration) {
          const nextTime = new Date(userData.nextHeartRegeneration).getTime();
          const now = new Date().getTime();
          setTimeUntilNextHeart(Math.max(0, nextTime - now));
        }
        // Close modal if hearts recovered
        if (userData.hearts > 0 && showHeartRecoveryModal) {
          setShowHeartRecoveryModal(false);
        }
      }
    } catch (error) {
      console.error("Error fetching hearts:", error);
    }
  };

  // Update timer for heart regeneration
  useEffect(() => {
    if (nextHeartRegeneration) {
      const nextTime = new Date(nextHeartRegeneration).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, nextTime - now);
        setTimeUntilNextHeart(remaining > 0 ? remaining : null);
        if (remaining === 0 && hearts < 5) {
          // Auto-refresh hearts when timer reaches 0
          fetchUserHearts();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextHeartRegeneration, hearts]);

  const handleNext = async () => {
    if (!lesson) return;

    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      // Lesson completed
      await completeLesson();
    }
  };

  const completeLesson = async () => {
    if (!lesson) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctAnswers: score.correct,
          totalQuestions: score.total,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLessonCompletionData({
          xpEarned: data.xpEarned || lesson.xpReward,
          achievements: data.achievements || [],
        });
        setShowCompletionModal(true);
        // Show achievement notifications
        if (data.achievements && data.achievements.length > 0) {
          setUnlockedAchievements((prev) => [...prev, ...data.achievements]);
        }
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueFromCompletion = () => {
    setShowCompletionModal(false);
    router.push("/dashboard");
  };

  if (status === "loading" || isLoading) {
    return (
      <ErrorBoundary>
        <LessonSkeleton />
      </ErrorBoundary>
    );
  }

  if (error || !lesson) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <ErrorMessage
              title="Unable to load lesson"
              message={error || "Lesson not found"}
              onRetry={error ? () => fetchLesson() : undefined}
            />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

    const isStoryLesson = lesson.type === "story";

    // If story lesson and story hasn't been read, show story first
    if (isStoryLesson && !hasReadStory) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Link href="/dashboard">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {lesson.title}
              </h1>
            </div>

            {loadingStory ? (
              <LoadingSpinner size="lg" />
            ) : storyData ? (
              <StoryReader
                title={storyData.title || lesson.title}
                content={storyData.content || lesson.description || ""}
                translation={storyData.translation ?? undefined}
                audioUrl={storyData.audioUrl ?? undefined}
                questions={storyData.questions?.map((q) => ({
                  id: q.id,
                  question: q.question,
                  correctAnswer: q.correctAnswer,
                  options: (q.options || []).map((opt: { id: string; text: string; isCorrect?: boolean }) => ({
                    id: opt.id,
                    text: opt.text,
                    isCorrect: opt.isCorrect ?? opt.id === q.correctAnswer,
                  })),
                })) || []}
                language={lesson.unit?.language?.code || "en-US"}
                onComplete={(_correct, _total) => {
                  setHasReadStory(true);
                  // Could award XP here
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-foreground-light">Story content coming soon...</p>
                  <Button
                    onClick={() => setHasReadStory(true)}
                    className="mt-4"
                  >
                    Continue to Exercises
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      );
    }

    const currentExercise = lesson.exercises[currentExerciseIndex];
    const isLastExercise = currentExerciseIndex === lesson.exercises.length - 1;
    const progress = ((currentExerciseIndex + 1) / lesson.exercises.length) * 100;

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {lesson.title}
                </h1>
                {!isStoryLesson && lesson.description && (
                  <p className="text-foreground-light">{lesson.description}</p>
                )}
                {isStoryLesson && (
                  <p className="text-foreground-light">Reading comprehension questions</p>
                )}
              </div>
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
              {/* XP */}
              <div className="text-right">
                <div className="text-sm text-foreground-light">Total XP</div>
                <div className="text-lg font-bold text-secondary">{totalXP}</div>
              </div>
              {/* Score */}
              <div className="text-right">
                <div className="text-sm text-foreground-light">
                  Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
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
            <CardTitle className="capitalize">
              {currentExercise.type.replace("_", " ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grammar Tip */}
            {currentExercise.grammarTip && (
              <GrammarTip content={currentExercise.grammarTip} expanded={false} />
            )}

            {/* Question */}
            <div className="text-xl font-semibold">
              {currentExercise.question}
            </div>

            {/* Exercise Type Specific UI */}
            {currentExercise.type === "multiple_choice" && (
              <div className="space-y-3">
                {currentExercise.options?.map((option) => (
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
                    disabled={isAnswered}
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
                  right: opt.text, // This should be parsed from correctAnswer or options structure
                }))}
                correctPairs={[currentExercise.correctAnswer]} // Should be parsed properly
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
                    missingPosition={0} // Should be parsed from question
                    options={currentExercise.options.map((opt) => opt.text)}
                    correctAnswer={currentExercise.correctAnswer}
                    onSelect={handleExerciseComplete}
                    disabled={isAnswered || hearts === 0}
                  />
                )}

                {currentExercise.type === "flashcard" && (
                  <Flashcard
                    word={currentExercise.question}
                    translation={currentExercise.correctAnswer}
                    phonetic={currentExercise.questionAudio || undefined}
                    audioUrl={currentExercise.questionAudio || undefined}
                    imageUrl={currentExercise.questionImage || undefined}
                    onAnswer={(knowsIt) => handleExerciseComplete(knowsIt)}
                    disabled={isAnswered || hearts === 0}
                  />
                )}

                {currentExercise.type === "speak" && (
                  <SpeakExercise
                    question={currentExercise.question}
                    correctAnswer={currentExercise.correctAnswer}
                    language={lesson.unit?.language?.code || "en-US"}
                    onComplete={handleExerciseComplete}
                    disabled={isAnswered || hearts === 0}
                  />
                )}

                {currentExercise.type === "listen_choose" && currentExercise.options && (
                  <ListenChooseExercise
                    question={currentExercise.question}
                    audioUrl={currentExercise.questionAudio || undefined}
                    audioText={currentExercise.correctAnswer}
                    options={currentExercise.options.map((opt) => ({
                      id: opt.id,
                      text: opt.text,
                      isCorrect: opt.isCorrect || false,
                    }))}
                    language={lesson.unit?.language?.code || "en-US"}
                    onSelect={handleExerciseComplete}
                    disabled={isAnswered || hearts === 0}
                  />
                )}

            {/* Feedback */}
            {isAnswered && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  isCorrect
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
                <div>
                  {isCorrect
                    ? `Correct! +${currentExercise.xpReward} XP`
                    : "Not quite. Try to remember this!"}
                </div>
              </div>
            )}

            {/* Action Buttons - Only show for exercises that need manual submission */}
            {!["match_pairs", "drag_drop", "select_missing", "flashcard", "speak", "listen_choose"].includes(currentExercise.type) && (
              <div className="flex gap-3">
                {!isAnswered ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer || hearts === 0}
                    className="flex-1"
                    title={hearts === 0 ? "Out of hearts! Recover hearts to continue." : ""}
                  >
                    {hearts === 0 ? "Out of Hearts" : "Check Answer"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isLastExercise
                      ? isSubmitting
                        ? "Completing..."
                        : "Complete Lesson"
                      : "Continue"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Notifications */}
        {unlockedAchievements.map((achievement, index) => (
          <AchievementNotification
            key={`${achievement.id}-${index}`}
            achievement={achievement}
            onClose={() => {
              setUnlockedAchievements((prev) =>
                prev.filter((a, i) => i !== index)
              );
            }}
            autoClose={true}
            duration={5000}
          />
        ))}

        {/* Lesson Completion Modal */}
        {showCompletionModal && lessonCompletionData && (
          <LessonCompletion
            isOpen={showCompletionModal}
            onClose={handleContinueFromCompletion}
            lessonTitle={lesson.title}
            score={score}
            xpEarned={lessonCompletionData.xpEarned}
            achievements={lessonCompletionData.achievements}
          />
        )}

        {/* Heart Recovery Modal */}
        {showHeartRecoveryModal && (
          <Modal
            isOpen={showHeartRecoveryModal}
            onClose={() => {
              // Only allow closing if hearts recovered
              if (hearts > 0) {
                setShowHeartRecoveryModal(false);
              }
            }}
            title="Out of Hearts!"
            description="You need hearts to continue learning. Recover them to keep going!"
            size="md"
            closeOnOverlayClick={hearts > 0}
          >
            <HeartRecovery
              currentHearts={hearts}
              maxHearts={5}
              nextRecoveryTime={nextHeartRegeneration}
              timeUntilNextHeart={timeUntilNextHeart}
              onRecover={fetchUserHearts}
              onWatchAd={fetchUserHearts}
            />
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-foreground-light mb-4 text-center">
                {hearts === 0
                  ? "You cannot continue until you recover at least one heart."
                  : "You can now continue learning!"}
              </p>
              {hearts > 0 && (
                <Button
                  onClick={() => setShowHeartRecoveryModal(false)}
                  className="w-full"
                >
                  Continue Lesson
                </Button>
              )}
            </div>
          </Modal>
        )}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

