"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Volume2,
  Image as ImageIcon,
} from "lucide-react";
import { CreateVocabularyModal } from "./create-vocabulary-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  difficulty: string;
  language: {
    id: string;
    code: string;
    name: string;
  };
}

interface Language {
  id: string;
  code: string;
  name: string;
}

export function VocabularyManager() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(
    null
  );

  useEffect(() => {
    fetchVocabularies();
    fetchLanguages();
  }, []);

  const fetchVocabularies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/admin/vocabulary");
      if (!response.ok) {
        throw new Error("Failed to fetch vocabularies");
      }
      const data = await response.json();
      setVocabularies(data.vocabularies || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching vocabularies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch("/api/admin/languages");
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || []);
      }
    } catch (err) {
      console.error("Error fetching languages:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vocabulary item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/vocabulary/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vocabulary");
      }

      setVocabularies((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete vocabulary";
      alert(errorMessage);
      console.error("Error deleting vocabulary:", err);
    }
  };

  const handleEdit = (vocabulary: Vocabulary) => {
    setEditingVocabulary(vocabulary);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingVocabulary(null);
  };

  const handleSuccess = () => {
    fetchVocabularies();
    handleModalClose();
  };

  // Get unique categories from vocabularies
  const categories = Array.from(
    new Set(
      vocabularies
        .map((v) => v.category)
        .filter((c): c is string => c !== null)
    )
  ).sort();

  // Filter vocabularies
  const filteredVocabularies = vocabularies.filter((vocab) => {
    const matchesSearch =
      vocab.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vocab.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vocab.phonetic &&
        vocab.phonetic.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage =
      selectedLanguage === "all" || vocab.language?.id === selectedLanguage;

    const matchesCategory =
      selectedCategory === "all" || vocab.category === selectedCategory;

    return matchesSearch && matchesLanguage && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error loading vocabularies"
        message={error}
        onRetry={fetchVocabularies}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Vocabulary Management
          </h2>
          <p className="text-sm text-foreground-light mt-1">
            Manage vocabulary words for all languages
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vocabulary
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-light" />
              <Input
                placeholder="Search words, translations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Languages</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocabularies.length === 0 ? (
          <div className="col-span-full text-center py-12 text-foreground-light">
            {searchQuery || selectedLanguage !== "all" || selectedCategory !== "all"
              ? "No vocabularies match your filters"
              : "No vocabularies found. Create your first vocabulary item!"}
          </div>
        ) : (
          filteredVocabularies.map((vocab) => (
            <Card key={vocab.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {vocab.word}
                    </CardTitle>
                    <p className="text-sm text-foreground-light mt-1">
                      {vocab.language.name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(vocab)}
                      aria-label="Edit vocabulary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vocab.id)}
                      aria-label="Delete vocabulary"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground-light mb-1">
                    Translation:
                  </p>
                  <p className="text-foreground">{vocab.translation}</p>
                </div>

                {vocab.phonetic && (
                  <div>
                    <p className="text-sm font-medium text-foreground-light mb-1">
                      Phonetic:
                    </p>
                    <p className="text-sm text-foreground font-mono">
                      {vocab.phonetic}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {vocab.category && (
                    <Badge variant="secondary">{vocab.category}</Badge>
                  )}
                  <Badge
                    variant={
                      vocab.difficulty === "easy"
                        ? "default"
                        : vocab.difficulty === "medium"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {vocab.difficulty}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {vocab.audioUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const audio = new Audio(vocab.audioUrl!);
                        audio.play().catch(console.error);
                      }}
                      aria-label="Play audio"
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      Audio
                    </Button>
                  )}
                  {vocab.imageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(vocab.imageUrl!, "_blank")}
                      aria-label="View image"
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Image
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateVocabularyModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          vocabulary={editingVocabulary ? { ...editingVocabulary, languageId: editingVocabulary.language.id } : null}
          languages={languages}
        />
      )}
    </div>
  );
}

