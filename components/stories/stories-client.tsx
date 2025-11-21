"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, ArrowRight, Filter, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Language {
  id: string;
  code: string;
  name: string;
  flagEmoji?: string | null;
}

interface Story {
  id: string;
  title: string;
  content: string;
  translation?: string | null;
  audioUrl?: string | null;
  difficulty: string;
  questionCount: number;
  language: {
    id: string;
    code: string;
    name: string;
    nativeName?: string;
    flagEmoji?: string | null;
  };
  lesson: {
    id: string;
    title: string;
    unitTitle: string;
  };
  isUnlocked: boolean;
}

interface StoriesClientProps {
  stories: Story[];
  languages: Language[];
}

export function StoriesClient({ stories, languages }: StoriesClientProps) {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      if (selectedLanguageId && story.language.id !== selectedLanguageId) {
        return false;
      }
      if (selectedDifficulty && story.difficulty !== selectedDifficulty) {
        return false;
      }
      return true;
    });
  }, [stories, selectedLanguageId, selectedDifficulty]);

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200",
  };

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Stories Available Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Stories will appear here as you progress through lessons!
          </p>
          <Link href="/dashboard">
            <Button className="bg-liberian-blue hover:bg-liberian-blue/90">
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Language:</span>
              <select
                value={selectedLanguageId || ""}
                onChange={(e) => setSelectedLanguageId(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.flagEmoji} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Difficulty:</span>
              <select
                value={selectedDifficulty || ""}
                onChange={(e) => setSelectedDifficulty(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedLanguageId || selectedDifficulty) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLanguageId(null);
                  setSelectedDifficulty(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg text-gray-600">
              No stories match your filters. Try adjusting your selection.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <Card
              key={story.id}
              className={cn(
                "hover:shadow-lg transition-all duration-200",
                !story.isUnlocked && "opacity-75"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {story.language.flagEmoji && (
                      <span className="text-2xl">{story.language.flagEmoji}</span>
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {story.language.name}
                    </span>
                  </div>
                  {story.isUnlocked ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <CardTitle className="text-xl line-clamp-2">{story.title}</CardTitle>
                <CardDescription className="text-sm">
                  {story.lesson.unitTitle} • {story.lesson.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Story Preview */}
                <p className="text-sm text-gray-600 line-clamp-3">
                  {story.content.substring(0, 150)}...
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full border",
                      difficultyColors[story.difficulty as keyof typeof difficultyColors] ||
                        "bg-gray-100 text-gray-800 border-gray-200"
                    )}
                  >
                    {story.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {story.questionCount} questions
                  </span>
                  {story.audioUrl && (
                    <span className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Audio
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <Link href={story.isUnlocked ? `/stories/${story.id}` : `/learn/${story.language.code}`}>
                  <Button
                    className={cn(
                      "w-full",
                      story.isUnlocked
                        ? "bg-liberian-blue hover:bg-liberian-blue/90"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    )}
                    disabled={!story.isUnlocked}
                  >
                    {story.isUnlocked ? (
                      <>
                        Read Story
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Complete Lesson to Unlock
                        <Lock className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}






