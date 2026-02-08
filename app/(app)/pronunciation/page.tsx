"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SpeakExercise } from "@/components/exercises/speak";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Mic, Volume2, ArrowLeft, RotateCcw, Filter, Globe } from "lucide-react";
import Link from "next/link";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";

interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  language?: {
    id: string;
    code: string;
    name: string;
    flagEmoji?: string | null;
  } | null;
}

export default function PronunciationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allVocabularies, setAllVocabularies] = useState<Vocabulary[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const { speak, isSupported } = useSpeechSynthesis({
    lang: "en-US",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchVocabularies();
    }
  }, [session, status, router]);

  const fetchVocabularies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/flashcards/review");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vocabularies");
      }

      // Map flashcards to vocabularies format
      const fetchedVocabularies: Vocabulary[] = (data.flashcards || []).map((flashcard: {
        id: string;
        word: string;
        translation: string;
        phonetic?: string | null;
        audioUrl?: string | null;
        languageId?: string | null;
        language?: {
          id: string;
          code: string;
          name: string;
          flagEmoji?: string | null;
        } | null;
      }) => ({
        id: flashcard.id,
        word: flashcard.word,
        translation: flashcard.translation,
        phonetic: flashcard.phonetic,
        audioUrl: flashcard.audioUrl,
        language: flashcard.languageId && flashcard.language ? {
          id: flashcard.languageId,
          code: flashcard.language.code || "",
          name: flashcard.language.name || "",
          flagEmoji: flashcard.language.flagEmoji || null,
        } : null,
      })) as Vocabulary[];
      setAllVocabularies(fetchedVocabularies);
      setVocabularies(fetchedVocabularies);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching vocabularies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
    }
    setReviewedCount(reviewedCount + 1);

    // Move to next vocabulary
    if (currentIndex < vocabularies.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 1500);
    } else {
      // All vocabularies reviewed
      setCompleted(true);
    }
  };

  const handlePlayAudio = () => {
    const current = vocabularies[currentIndex];
    if (current?.audioUrl) {
      const audio = new Audio(current.audioUrl);
      audio.play().catch(console.error);
    } else if (current?.word && isSupported) {
      speak(current.word);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setReviewedCount(0);
    setCompleted(false);
  };

  // Filter vocabularies by selected language
  useEffect(() => {
    if (selectedLanguageId) {
      setVocabularies(
        allVocabularies.filter((v) => v.language?.id === selectedLanguageId)
      );
    } else {
      setVocabularies(allVocabularies);
    }
    // Reset to first item when filter changes
    setCurrentIndex(0);
    setCorrectCount(0);
    setReviewedCount(0);
    setCompleted(false);
  }, [selectedLanguageId, allVocabularies]);

  // Get unique languages from vocabularies
  const languageMap = new Map<string, NonNullable<Vocabulary["language"]>>();
  allVocabularies.forEach((v) => {
    if (v.language?.id) {
      languageMap.set(v.language.id, v.language);
    }
  });
  const availableLanguages = Array.from(languageMap.values());

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
        <ErrorMessage title="Error loading pronunciation practice" message={error} onRetry={fetchVocabularies} />
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Card>
            <CardContent className="p-12 text-center">
              <Mic className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Vocabulary Available
              </h2>
              <p className="text-gray-600 mb-6">
                Start learning a language to practice pronunciation!
              </p>
              <Link href="/learn">
                <Button className="bg-liberian-blue hover:bg-liberian-blue/90">
                  Browse Languages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const current = vocabularies[currentIndex];
  const progress =
    vocabularies.length > 0
      ? ((reviewedCount + 1) / vocabularies.length) * 100
      : 0;

  if (completed) {
    const accuracy =
      reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0;

    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-liberian-red">
                Practice Complete! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold text-liberian-blue mb-2">
                    {accuracy}%
                  </div>
                  <p className="text-lg text-gray-600">Accuracy</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {correctCount}
                    </div>
                    <p className="text-sm text-gray-600">Correct</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {reviewedCount}
                    </div>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice Again
                </Button>
                <Link href="/dashboard">
                  <Button className="bg-liberian-blue hover:bg-liberian-blue/90">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-liberian-red mb-2 flex items-center gap-3">
                <Mic className="h-10 w-10" />
                Pronunciation Practice
              </h1>
              <p className="text-lg text-gray-600">
                Practice speaking Liberian languages
              </p>
            </div>
          </div>

          {/* Language Filter */}
          {availableLanguages.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Filter by Language</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedLanguageId || ""}
                    onChange={(e) => setSelectedLanguageId(e.target.value || null)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm flex-1 max-w-xs"
                  >
                    <option value="">All Languages ({allVocabularies.length})</option>
                    {availableLanguages.map((lang) => {
                      const count = allVocabularies.filter(
                        (v) => v.language?.id === lang.id
                      ).length;
                      return (
                        <option key={lang.id} value={lang.id}>
                          {lang.flagEmoji} {lang.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                  {selectedLanguageId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLanguageId(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            <div>
              <span className="text-sm text-gray-600">Progress</span>
              <div className="text-2xl font-bold text-liberian-blue">
                {reviewedCount + 1} / {vocabularies.length}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Correct</span>
              <div className="text-2xl font-bold text-green-600">
                {correctCount}
              </div>
            </div>
            <div className="flex-1">
              <ProgressBar value={progress} variant="default" className="h-3" />
            </div>
          </div>
        </div>

        {/* Pronunciation Exercise */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Word {currentIndex + 1} of {vocabularies.length}
              </CardTitle>
              {current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayAudio}
                  className="gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {current && (
              <div className="space-y-4">
                {current.language?.flagEmoji && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-xl">{current.language.flagEmoji}</span>
                    <span>{current.language.name}</span>
                  </div>
                )}
                {current.phonetic && (
                  <div className="text-sm text-gray-600 italic">
                    [{current.phonetic}]
                  </div>
                )}
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {current.translation}
                </div>
                <SpeakExercise
                  question={`Say "${current.word}"`}
                  correctAnswer={current.word}
                  language={current.language?.code || "en-US"}
                  onComplete={handleComplete}
                  disabled={false}
                  showScoring={true}
                  audioUrl={current.audioUrl || undefined}
                  phonetic={current.phonetic || undefined}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

