"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateUnitModal } from "./create-unit-modal";
import { CreateLessonModal } from "./create-lesson-modal";
import { CreateExerciseModal } from "./create-exercise-modal";
import { ChevronDown, ChevronRight, Plus, Book, Play } from "lucide-react";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flagEmoji?: string | null;
  units: Unit[];
}

interface Unit {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  difficulty: string;
  languageId: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  type: string;
  xpReward: number;
  unitId: string;
  _count: {
    exercises: number;
  };
}

interface ContentManagerProps {
  languages: Language[];
}

export function ContentManager({ languages: initialLanguages }: ContentManagerProps) {
  const [languages, setLanguages] = useState(initialLanguages);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [createUnitModal, setCreateUnitModal] = useState<{ open: boolean; languageId?: string }>({ open: false });
  const [createLessonModal, setCreateLessonModal] = useState<{ open: boolean; unitId?: string }>({ open: false });
  const [createExerciseModal, setCreateExerciseModal] = useState<{ open: boolean; lessonId?: string }>({ open: false });

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const handleRefresh = async () => {
    const response = await fetch("/api/admin/content");
    if (response.ok) {
      const data = await response.json();
      setLanguages(data.languages);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Unit Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Content Tree</h2>
        <Button data-testid="open-create-unit" onClick={() => setCreateUnitModal({ open: true })}>
          <Plus className="mr-2 h-4 w-4" />
          Create Unit
        </Button>
      </div>

      {/* Languages */}
      {languages.map((language) => (
        <Card key={language.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{language.flagEmoji || "🏳️"}</span>
                <div>
                  <CardTitle>{language.name}</CardTitle>
                  <CardDescription>{language.nativeName}</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateUnitModal({ open: true, languageId: language.id })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {language.units.length === 0 ? (
                <p className="text-sm text-foreground-light italic">No units yet</p>
              ) : (
                language.units.map((unit) => (
                  <div key={unit.id} className="border-l-2 border-primary/20 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => toggleUnit(unit.id)}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {expandedUnits.has(unit.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Book className="h-4 w-4" />
                        <span className="font-semibold">{unit.title}</span>
                        <span className="text-xs text-foreground-light">
                          ({unit.lessons.length} lessons)
                        </span>
                      </button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCreateLessonModal({ open: true, unitId: unit.id })}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Lesson
                        </Button>
                      </div>
                    </div>

                    {expandedUnits.has(unit.id) && (
                      <div className="ml-6 space-y-2 mt-2">
                        {unit.lessons.length === 0 ? (
                          <p className="text-xs text-foreground-light italic">No lessons yet</p>
                        ) : (
                          unit.lessons.map((lesson) => (
                            <div key={lesson.id} className="border-l-2 border-secondary/20 pl-4">
                              <div className="flex items-center justify-between mb-1">
                                <button
                                  onClick={() => toggleLesson(lesson.id)}
                                  className="flex items-center gap-2 hover:text-secondary transition-colors"
                                >
                                  {expandedLessons.has(lesson.id) ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                  <Play className="h-3 w-3" />
                                  <span className="text-sm font-medium">{lesson.title}</span>
                                  <span className="text-xs text-foreground-light">
                                    ({lesson._count.exercises} exercises)
                                  </span>
                                </button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCreateExerciseModal({ open: true, lessonId: lesson.id })}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Exercise
                                </Button>
                              </div>

                              {expandedLessons.has(lesson.id) && (
                                <div className="ml-4 mt-1">
                                  <div className="text-xs text-foreground-light space-y-1">
                                    <div>Type: {lesson.type}</div>
                                    <div>XP Reward: {lesson.xpReward}</div>
                                    <div>Exercises: {lesson._count.exercises}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Modals */}
      <CreateUnitModal
        isOpen={createUnitModal.open}
        onClose={() => setCreateUnitModal({ open: false })}
        onSuccess={handleRefresh}
        defaultLanguageId={createUnitModal.languageId}
        languages={languages}
      />

      <CreateLessonModal
        isOpen={createLessonModal.open}
        onClose={() => setCreateLessonModal({ open: false })}
        onSuccess={handleRefresh}
        defaultUnitId={createLessonModal.unitId}
        languages={languages}
      />

      <CreateExerciseModal
        isOpen={createExerciseModal.open}
        onClose={() => setCreateExerciseModal({ open: false })}
        onSuccess={handleRefresh}
        defaultLessonId={createExerciseModal.lessonId}
        languages={languages}
      />
    </div>
  );
}

