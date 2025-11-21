"use client";

import { useRef, lazy, Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Star, Award, Trophy, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnitBanner } from "./unit-banner";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load heavy components for code splitting
const PathCharacter = lazy(() => import("./path-character").then(m => ({ default: m.PathCharacter })));
const TreasureChestBonus = lazy(() => import("./treasure-chest-bonus").then(m => ({ default: m.TreasureChestBonus })));
const UnitProgressIndicator = lazy(() => import("./unit-progress-indicator").then(m => ({ default: m.UnitProgressIndicator })));
const LazyLessonCard = lazy(() => import("./lazy-lesson-card").then(m => ({ default: m.LazyLessonCard })));

interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  order: number;
  type: string;
}

interface Unit {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface LearningPathProps {
  units: Unit[];
  completedLessonIds: Set<string>;
  unlockedLessonIds: Set<string>;
  languageCode?: string;
  currentLessonId?: string | null;
  showBanners?: boolean; // Show prominent unit banners
  bannerColors?: Array<"green" | "purple" | "teal" | "blue">; // Colors for banners
  showProgressIndicators?: boolean; // Show unit progress indicators
  mobileOptimized?: boolean; // Optimize for mobile devices
  enableSwipeNavigation?: boolean; // Enable swipe navigation on mobile
}

export function LearningPath({
  units,
  completedLessonIds,
  unlockedLessonIds,
  languageCode: _languageCode,
  currentLessonId,
  showBanners = true,
  bannerColors = ["green", "purple", "teal", "blue"],
  showProgressIndicators = true,
  mobileOptimized = true,
  enableSwipeNavigation = true,
}: LearningPathProps) {
  // Get color for unit banner (cycle through colors)
  const getUnitColor = (unitIndex: number): "green" | "purple" | "teal" | "blue" => {
    return bannerColors[unitIndex % bannerColors.length] || "green";
  };

  // Find current lesson index for swipe navigation
  const getCurrentLessonIndex = (): { unitIndex: number; lessonIndex: number } | null => {
    for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
      const unit = units[unitIndex];
      for (let lessonIndex = 0; lessonIndex < unit.lessons.length; lessonIndex++) {
        if (unit.lessons[lessonIndex].id === currentLessonId) {
          return { unitIndex, lessonIndex };
        }
      }
    }
    return null;
  };

  // Swipe navigation handlers
  const handleSwipeLeft = () => {
    if (!enableSwipeNavigation) return;
    const current = getCurrentLessonIndex();
    if (!current) return;

    // Find next unlocked lesson
    for (let i = current.unitIndex; i < units.length; i++) {
      const startLessonIndex = i === current.unitIndex ? current.lessonIndex + 1 : 0;
      for (let j = startLessonIndex; j < units[i].lessons.length; j++) {
        const lesson = units[i].lessons[j];
        if (unlockedLessonIds.has(lesson.id)) {
          window.location.href = `/lesson/${lesson.id}`;
          return;
        }
      }
    }
  };

  const handleSwipeRight = () => {
    if (!enableSwipeNavigation) return;
    const current = getCurrentLessonIndex();
    if (!current) return;

    // Find previous unlocked lesson
    for (let i = current.unitIndex; i >= 0; i--) {
      const startLessonIndex = i === current.unitIndex ? current.lessonIndex - 1 : units[i].lessons.length - 1;
      for (let j = startLessonIndex; j >= 0; j--) {
        const lesson = units[i].lessons[j];
        if (unlockedLessonIds.has(lesson.id)) {
          window.location.href = `/lesson/${lesson.id}`;
          return;
        }
      }
    }
  };

  // Swipe gesture hook
  const swipeRef = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    velocity: 0.3,
  });

  return (
    <div
      ref={swipeRef as React.RefObject<HTMLDivElement>}
      className="relative py-4 md:py-8 optimized-animation"
      role="navigation"
      aria-label="Learning path"
    >
      {/* Enhanced Path Line - more prominent like Duolingo */}
      <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-liberian-blue via-liberian-red to-liberian-blue z-0 gpu-accelerated" />

      {/* Lessons */}
      <div className="relative space-y-8">
        {units.map((unit, unitIndex) => {
          // Check if this unit has the current lesson
          const hasCurrentLesson = unit.lessons.some(
            (lesson) => lesson.id === currentLessonId
          );
          const unitColor = getUnitColor(unitIndex);

          return (
            <div key={unit.id} className="relative mb-8">
              {/* Prominent Unit Banner (Duolingo-style) */}
              {showBanners && hasCurrentLesson && (
                <div className="mb-6">
                  <UnitBanner
                    section={`SECTION ${unit.order > 5 ? Math.ceil(unit.order / 5) : 1}`}
                    unit={unit.order}
                    title={unit.title}
                    color={unitColor}
                  />
                </div>
              )}

              {/* Unit Progress Indicator - Lazy loaded */}
              {showProgressIndicators && (
                <div className="mb-4">
                  <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-lg" />}>
                    <UnitProgressIndicator
                      completedLessons={unit.lessons.filter((l) => completedLessonIds.has(l.id)).length}
                      totalLessons={unit.lessons.length}
                      unitTitle={unit.title}
                      unitOrder={unit.order}
                      size={mobileOptimized ? "sm" : "md"}
                    />
                  </Suspense>
                </div>
              )}

              {/* Unit Header (fallback if banner not shown) */}
              {(!showBanners || !hasCurrentLesson) && !showProgressIndicators && (
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Unit {unit.order}: {unit.title}
                  </h2>
                </div>
              )}

            {/* Lessons in Unit */}
            <div className="space-y-6 ml-0">
              {unit.lessons.map((lesson, lessonIndex) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const isUnlocked = unlockedLessonIds.has(lesson.id) || lessonIndex === 0;
                const isCurrent = lesson.id === currentLessonId;
                const isLocked = !isUnlocked;

                const isLastInUnit = lessonIndex === unit.lessons.length - 1;
                const isLastUnit = unitIndex === units.length - 1;

                // Check if all lessons in this unit are completed (for treasure chest)
                const allUnitLessonsCompleted = unit.lessons.every((l) =>
                  completedLessonIds.has(l.id)
                );

                // Lazy load lessons after first 3 (for performance)
                const shouldLazyLoad = mobileOptimized && lessonIndex > 2;

                return (
                  <div key={lesson.id} className="relative">
                    {/* Character/Mascot placement for current lesson - Lazy loaded */}
                    {isCurrent && (
                      <Suspense fallback={null}>
                        <PathCharacter
                          isVisible={true}
                          position="left"
                          character="excited"
                        />
                      </Suspense>
                    )}

                    {/* Lazy-loaded lesson card */}
                    <Suspense fallback={
                      <div className="flex items-start gap-6">
                        <div className={cn("rounded-full bg-gray-200 animate-pulse", mobileOptimized ? "w-12 h-12 md:w-16 md:h-16" : "w-16 h-16")} />
                        <div className={cn("flex-1 bg-gray-100 animate-pulse rounded-xl", mobileOptimized ? "p-3 md:p-4 h-20 md:h-24" : "p-4 h-24")} />
                      </div>
                    }>
                      <LazyLessonCard
                        lesson={lesson}
                        isCompleted={isCompleted}
                        isUnlocked={isUnlocked}
                        isCurrent={isCurrent}
                        isLocked={isLocked}
                        mobileOptimized={mobileOptimized}
                        shouldLazyLoad={shouldLazyLoad}
                      />
                    </Suspense>

                    {/* Enhanced Connection Line (wider, colored based on state) - Mobile optimized */}
                    {!(isLastInUnit && isLastUnit) && (
                      <div
                        className={cn(
                          "absolute z-0",
                          mobileOptimized ? "left-4 md:left-8 top-16 md:top-20 w-0.5 md:w-1 h-6 md:h-8" : "left-8 top-20 w-1 h-8",
                          isCompleted
                            ? "bg-green-500"
                            : isLocked
                            ? "bg-gray-300 opacity-50"
                            : "bg-liberian-blue"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Treasure Chest Bonus (after completing unit) - Lazy loaded */}
            {isLastInUnit && unitIndex < units.length - 1 && (
              <Suspense fallback={<div className="h-20 flex items-center justify-center my-6"><LoadingSpinner size="sm" /></div>}>
                <TreasureChestBonus
                  unitId={unit.id}
                  unitTitle={unit.title}
                  isUnlocked={unit.lessons.every((l) => completedLessonIds.has(l.id))}
                  bonusXP={50}
                  className="my-6"
                />
              </Suspense>
            )}

            {/* Unit Separator (except for last unit) */}
            {unitIndex < units.length - 1 && (
              <div className="mt-8 mb-8 flex items-center gap-4">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="px-4 py-2 bg-liberian-blue/10 rounded-full border-2 border-liberian-blue/20">
                  <span className="text-sm font-semibold text-liberian-blue">
                    Unit {unit.order + 1} →
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}

