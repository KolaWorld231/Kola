"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause } from "lucide-react";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  content: string;
  translation?: string;
  audioUrl?: string;
  difficulty: string;
  lesson: {
    unit: {
      language: {
        name: string;
        flagEmoji?: string;
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
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchStory();
  }, [params.id]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data);
      } else {
        router.push("/stories");
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      router.push("/stories");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionId: string, isCorrect: boolean) => {
    setSelectedAnswer(optionId);
    setShowResult(true);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < story!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading story...</div>;
  }

  if (!story) {
    return <div className="container mx-auto px-4 py-8">Story not found.</div>;
  }

  const currentQ = story.questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/stories">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Button>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{story.lesson.unit.language.flagEmoji}</span>
          <h1 className="text-3xl font-bold">{story.title}</h1>
          <Badge variant="secondary">{story.difficulty}</Badge>
        </div>
        <p className="text-muted-foreground">
          {story.lesson.unit.language.name} • {story.lesson.unit.title}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Story Content */}
        <Card>
          <CardHeader>
            <CardTitle>Story</CardTitle>
            {story.audioUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioPlaying(!audioPlaying)}
                className="w-fit"
              >
                {audioPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {audioPlaying ? "Pause" : "Play"} Audio
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{story.content}</p>
            </div>
            {story.translation && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">English Translation</h4>
                <p className="whitespace-pre-wrap text-sm">{story.translation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Comprehension Questions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {story.questions.length}
            </p>
          </CardHeader>
          <CardContent>
            {currentQ ? (
              <div>
                <h3 className="font-semibold mb-4">{currentQ.question}</h3>
                <div className="space-y-2">
                  {currentQ.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        showResult
                          ? option.isCorrect
                            ? "default"
                            : selectedAnswer === option.id
                            ? "destructive"
                            : "outline"
                          : selectedAnswer === option.id
                          ? "secondary"
                          : "outline"
                      }
                      className="w-full justify-start"
                      onClick={() => !showResult && handleAnswer(option.id, option.isCorrect)}
                      disabled={showResult}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
                {showResult && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Correct answer: {currentQ.correctAnswer}
                    </p>
                    {currentQuestion < story.questions.length - 1 ? (
                      <Button onClick={nextQuestion} className="w-full">
                        Next Question
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="font-semibold mb-2">
                          Quiz Complete! Score: {score}/{story.questions.length}
                        </p>
                        <Link href="/stories">
                          <Button>Back to Stories</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p>No questions available for this story.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}