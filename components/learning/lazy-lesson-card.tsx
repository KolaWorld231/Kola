"use client";

import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle2, Lock, Star, Award } from "lucide-react";

interface LazyLessonCardProps {
  lesson: {
    id: string;
    title: string;
    xpReward: number;
    type: string;
  };
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  mobileOptimized: boolean;
  shouldLazyLoad: boolean;
}

/**
 * Lazy-loaded lesson card component
 * Only renders full content when visible (for performance)
 */
export function LazyLessonCard({
  lesson,
  isCompleted,
  isUnlocked,
  isCurrent,
  isLocked,
  mobileOptimized,
  shouldLazyLoad,
}: LazyLessonCardProps) {
  const { elementRef, hasIntersected } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "100px",
    enabled: shouldLazyLoad,
  });

  const shouldRender = !shouldLazyLoad || hasIntersected;

  return (
    <div
      ref={elementRef}
      className="relative flex items-start gap-6"
    >
      {/* Enhanced Node - Mobile optimized */}
      <div className="relative z-10 flex-shrink-0">
        {shouldRender ? (
          <>
            {isLocked ? (
              <div
                className={cn(
                  "rounded-full bg-gray-300 border-4 border-white flex items-center justify-center shadow-md opacity-60",
                  mobileOptimized ? "w-12 h-12 md:w-16 md:h-16" : "w-16 h-16"
                )}
                role="button"
                aria-label={`Lesson ${lesson.title} is locked`}
                tabIndex={-1}
              >
                <Lock className={cn("text-gray-500", mobileOptimized ? "h-5 w-5 md:h-7 md:w-7" : "h-7 w-7")} />
              </div>
            ) : isCompleted ? (
              <Link
                href={`/lesson/${lesson.id}`}
                className={cn(
                  "rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer animate-lesson-complete touch-manipulation",
                  mobileOptimized ? "w-12 h-12 md:w-16 md:h-16" : "w-16 h-16"
                )}
                aria-label={`Lesson ${lesson.title} completed`}
                tabIndex={0}
              >
                <CheckCircle2 className={cn("text-white", mobileOptimized ? "h-6 w-6 md:h-8 md:w-8" : "h-8 w-8")} />
              </Link>
            ) : isCurrent ? (
              <Link
                href={`/lesson/${lesson.id}`}
                className={cn(
                  "rounded-full bg-liberian-red border-4 border-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-smooth cursor-pointer ring-4 ring-liberian-red/30 animate-pulse touch-manipulation",
                  mobileOptimized ? "w-16 h-16 md:w-20 md:h-20" : "w-20 h-20"
                )}
                aria-label={`Current lesson: ${lesson.title}`}
                tabIndex={0}
              >
                <Star className={cn("text-white fill-white", mobileOptimized ? "h-8 w-8 md:h-10 md:w-10" : "h-10 w-10")} />
              </Link>
            ) : (
              <Link
                href={`/lesson/${lesson.id}`}
                className={cn(
                  "rounded-full bg-liberian-blue border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer hover:bg-liberian-red touch-manipulation",
                  mobileOptimized ? "w-12 h-12 md:w-16 md:h-16" : "w-16 h-16"
                )}
                aria-label={`Lesson ${lesson.title} - Click to start`}
                tabIndex={0}
              >
                <Star className={cn("text-white", mobileOptimized ? "h-6 w-6 md:h-8 md:w-8" : "h-8 w-8")} />
              </Link>
            )}
          </>
        ) : (
          // Placeholder for lazy loading
          <div
            className={cn(
              "rounded-full bg-gray-200 border-4 border-white animate-pulse",
              mobileOptimized ? "w-12 h-12 md:w-16 md:h-16" : "w-16 h-16"
            )}
          />
        )}
      </div>

      {/* Lesson Info */}
      {shouldRender ? (
        <div className="flex-1 pt-1">
          <Link
            href={isUnlocked ? `/lesson/${lesson.id}` : "#"}
            className={cn(
              "block rounded-xl border-2 transition-all touch-manipulation",
              mobileOptimized ? "p-3 md:p-4" : "p-4",
              isLocked
                ? "bg-gray-50 border-gray-200 cursor-not-allowed"
                : isCompleted
                ? "bg-green-50 border-green-300 hover:border-green-400 active:bg-green-100 hover:shadow-md"
                : isCurrent
                ? "bg-liberian-red/10 border-liberian-red hover:border-liberian-red/80 active:bg-liberian-red/20 hover:shadow-lg ring-2 ring-liberian-red/20"
                : "bg-white border-liberian-blue hover:border-liberian-red active:bg-liberian-blue/10 hover:shadow-md"
            )}
            aria-label={
              isLocked
                ? `Lesson ${lesson.title} is locked`
                : isCompleted
                ? `Lesson ${lesson.title} completed - Click to review`
                : isCurrent
                ? `Current lesson: ${lesson.title} - Click to continue`
                : `Lesson ${lesson.title} - Click to start`
            }
            tabIndex={isLocked ? -1 : 0}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3
                  className={cn(
                    "font-semibold mb-1",
                    mobileOptimized ? "text-base md:text-lg" : "text-lg",
                    isLocked ? "text-gray-400" : "text-gray-900"
                  )}
                >
                  {lesson.title}
                </h3>
                <div className={cn("flex items-center gap-3 text-gray-600", mobileOptimized ? "text-xs md:text-sm" : "text-sm")}>
                  <span className="capitalize">{lesson.type}</span>
                  <span>•</span>
                  <span className="font-semibold text-liberian-red">
                    +{lesson.xpReward} XP
                  </span>
                </div>
              </div>
              {isCompleted && (
                <Award className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          </Link>
        </div>
      ) : (
        // Placeholder for lazy loading
        <div className="flex-1 pt-1">
          <div className={cn(
            "block rounded-xl border-2 bg-gray-100 animate-pulse",
            mobileOptimized ? "p-3 md:p-4 h-20 md:h-24" : "p-4 h-24"
          )} />
        </div>
      )}
    </div>
  );
}


