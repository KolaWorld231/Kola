"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LanguageListSkeleton } from "@/components/ui/language-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useCachedFetch } from "@/hooks/use-cached-fetch";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { apiValidators } from "@/lib/api-response-validator";
import { toast } from "sonner";
import Link from "next/link";

export default function CoursesPage() {
  const { data: session } = useSession();
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);

  // Use cached fetch for user courses (cached per user) with response validation
  const { 
    data: coursesData, 
    isLoading, 
    error: _error,
    refetch 
  } = useCachedFetch(
    () => fetch("/api/user/courses").then(async (r) => {
      if (!r.ok) {
        throw new Error(`Failed to fetch courses: ${r.status}`);
      }
      // Validate response with type guards
      return apiValidators.userCourses(r);
    }),
    {
      cacheKey: session?.user?.id ? CACHE_KEYS.userCourses(session.user.id) : "",
      ttl: CACHE_TTL.USER_DATA,
      enabled: !!session?.user?.id,
      onError: (err) => {
        toast.error("Failed to load courses");
        console.error("Error fetching courses:", err);
      },
    }
  );

  const languages = coursesData?.languages || [];
  const currentSelectedLanguageId = coursesData?.selectedLanguageId || null;

  // Update selected language ID when data changes
  useEffect(() => {
    if (currentSelectedLanguageId !== null) {
      setSelectedLanguageId(currentSelectedLanguageId);
    }
  }, [currentSelectedLanguageId]);

  const fetchData = refetch; // Alias for compatibility

  const handleRemoveLanguage = async (languageId: string) => {
    if (languageId === selectedLanguageId) {
      toast.error("Cannot remove your currently selected language. Please select a different language first.");
      return;
    }

    if (!confirm("Are you sure you want to remove this course? This will not delete your progress.")) {
      return;
    }

    try {
      const response = await fetch(`/api/user/courses/${languageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Course removed successfully");
        // Refresh the languages list
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to remove course");
      }
    } catch (error) {
      console.error("Error removing course:", error);
      toast.error("Failed to remove course");
    }
  };

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <LanguageListSkeleton count={6} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground-darkMode mb-2">Courses</h1>
      </div>

      {/* Languages List */}
      <div className="space-y-4">
        {languages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-foreground-darkModeLight">
            <p>No courses available yet.</p>
            <Link href="/learn" className="mt-4 inline-block">
              <Button className="bg-liberian-blue hover:bg-liberian-blue/90 text-white">
                Add a Course
              </Button>
            </Link>
          </div>
        ) : (
          languages.map((language) => (
            <div
              key={language.id}
              className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-border-darkMode last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flagEmoji || "🏳️"}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-foreground-darkMode">{language.name}</div>
                  {language.nativeName && (
                    <div className="text-sm text-gray-500 dark:text-foreground-darkModeLight">{language.nativeName}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {language.id === selectedLanguageId && (
                  <span className="text-xs text-liberian-blue font-medium">ACTIVE</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveLanguage(language.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  REMOVE
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Course Link */}
      <div className="pt-6 border-t border-gray-200 dark:border-border-darkMode">
        <Link href="/learn">
          <Button variant="outline" className="text-liberian-blue border-liberian-blue hover:bg-liberian-blue/10">
            + Add a Course
          </Button>
        </Link>
      </div>
      </div>
    </ErrorBoundary>
  );
}


