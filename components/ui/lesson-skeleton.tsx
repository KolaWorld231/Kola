"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for lesson page
 */
export function LessonSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Lesson header skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
      </Card>

      {/* Progress bar skeleton */}
      <div className="mb-6">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between mt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Hearts skeleton */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-full" />
        ))}
      </div>

      {/* Exercise card skeleton */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Question skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>

          {/* Options skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>

          {/* Action button skeleton */}
          <div className="mt-6">
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Grammar tip skeleton */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </CardContent>
      </Card>
    </div>
  );
}

