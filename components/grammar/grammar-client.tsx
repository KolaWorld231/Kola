"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GrammarTip } from "@/components/exercises/grammar-tip";
import { Filter, Search, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Language {
  id: string;
  code: string;
  name: string;
  flagEmoji?: string | null;
}

interface GrammarTipData {
  id: string;
  title: string;
  content: string;
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
  difficulty: string;
  question: string;
}

interface GrammarClientProps {
  grammarTips: GrammarTipData[];
  languages: Language[];
}

export function GrammarClient({ grammarTips, languages }: GrammarClientProps) {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTips = useMemo(() => {
    return grammarTips.filter((tip) => {
      if (selectedLanguageId && tip.language.id !== selectedLanguageId) {
        return false;
      }
      if (selectedDifficulty && tip.difficulty !== selectedDifficulty) {
        return false;
      }
      if (
        searchQuery &&
        !tip.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tip.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tip.question.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [grammarTips, selectedLanguageId, selectedDifficulty, searchQuery]);

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200",
  };

  if (grammarTips.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Grammar Tips Available Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Grammar tips will appear here as you complete exercises!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Search & Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search grammar tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
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
            {(selectedLanguageId || selectedDifficulty || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLanguageId(null);
                  setSelectedDifficulty(null);
                  setSearchQuery("");
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredTips.length} of {grammarTips.length} grammar tips
      </div>

      {/* Grammar Tips List */}
      {filteredTips.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg text-gray-600">
              No grammar tips match your search. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTips.map((tip) => (
            <Card key={tip.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {tip.language.flagEmoji && (
                      <span className="text-xl">{tip.language.flagEmoji}</span>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {tip.language.name}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full border text-xs",
                        difficultyColors[tip.difficulty as keyof typeof difficultyColors] ||
                          "bg-gray-100 text-gray-800 border-gray-200"
                      )}
                    >
                      {tip.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {tip.lesson.unitTitle} • {tip.lesson.title}
                  </div>
                </div>
                <CardTitle className="text-lg">
                  Related Exercise
                </CardTitle>
                <CardDescription className="text-sm">
                  {tip.question}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GrammarTip
                  title="Grammar Explanation"
                  content={tip.content}
                  expanded={false}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

