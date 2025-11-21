"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { StoryReader } from "@/components/exercises/story-reader";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface StoryData {
  id: string;
  title: string;
  content: string;
  translation?: string | null;
  audioUrl?: string | null;
  difficulty: string;
  lesson: {
    id: string;
    title: string;
    unit: {
      language: {
        code: string;
      };
    };
  };
  questions: Array<{
    id: string;
    question: string;
    correctAnswer: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export default function StoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.id && storyId) {
      fetchStory();
    }
  }, [session, status, router, storyId]);

  const fetchStory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, we need to find the lesson ID for this story
      const response = await fetch(`/api/stories/by-id/${storyId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Story not found");
        }
        throw new Error("Failed to fetch story");
      }

      const data = await response.json();
      setStoryData(data.story);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching story:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (correct: number, total: number) => {
    setScore({ correct, total });
    setCompleted(true);

    // Award XP for completing the story
    try {
      const accuracy = total > 0 ? (correct / total) * 100 : 0;
      let xpReward = 0;

      if (accuracy >= 80) {
        xpReward = 30; // Perfect score
      } else if (accuracy >= 60) {
        xpReward = 20; // Good score
      } else {
        xpReward = 10; // Completed
      }

      const response = await fetch("/api/user/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: xpReward,
          source: "story",
          sourceId: storyId,
          description: `Completed story: ${storyData?.title}`,
        }),
      });

      if (response.ok) {
        toast.success(`+${xpReward} XP earned!`, {
          description: `You answered ${correct} out of ${total} questions correctly.`,
        });
      }
    } catch (err) {
      console.error("Error awarding XP:", err);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <ErrorMessage
          title="Error loading story"
          message={error}
          onRetry={fetchStory}
        />
      </div>
    );
  }

  if (!storyData) {
    return null;
  }

  if (completed && score) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8 max-w-3xl">
          <div className="mb-8">
            <Link href="/stories">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Stories
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-liberian-red">
              Story Complete!
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-liberian-gold" />
              <p className="text-2xl font-bold text-liberian-blue">
                {accuracy}% Accuracy
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {score.correct}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-3xl font-bold text-gray-900">
                  {score.total}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/stories">
                <Button variant="outline">
                  Read Another Story
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-liberian-blue hover:bg-liberian-blue/90">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/stories">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stories
            </Button>
          </Link>
        </div>

        <StoryReader
          title={storyData.title}
          content={storyData.content}
          translation={storyData.translation || undefined}
          audioUrl={storyData.audioUrl || undefined}
          questions={storyData.questions.map((q) => ({
            id: q.id,
            question: q.question,
            correctAnswer: q.correctAnswer,
            options: q.options.map((opt) => ({
              id: opt.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          }))}
          language={storyData.lesson.unit.language.code || "en-US"}
          onComplete={handleComplete}
          disabled={false}
        />
      </div>
    </div>
  );
}

