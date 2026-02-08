import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { LearningPath } from "@/components/learning/learning-path";
import { PathStatsBar } from "@/components/learning/path-stats-bar";
import { LearningPathErrorBoundary } from "@/components/learning/learning-path-error-boundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PageProps {
  params: {
    code: string;
  };
}

export default async function LanguageLearningPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const language = await prisma.language.findUnique({
    where: { code: params.code, isActive: true },
    include: {
      units: {
        include: {
          lessons: {
            include: {
              _count: {
                select: { exercises: true },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!language) {
    redirect("/learn");
  }

  // Fetch user with stats
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      currentStreak: true,
      totalXP: true,
      hearts: true,
    },
  });

  // Update user's selected language
  await prisma.user.update({
    where: { id: session.user.id },
    data: { selectedLanguageId: language.id },
  });

  // Get user progress
  const userProgress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: {
        unit: {
          languageId: language.id,
        },
      },
    },
  });

  const completedLessonIds = new Set(
    userProgress.filter((p) => p.isCompleted).map((p) => p.lessonId)
  );

  // Determine which lessons are unlocked
  const getLessonStatus = (unitIndex: number, lessonIndex: number) => {
    if (unitIndex === 0 && lessonIndex === 0) {
      return "unlocked";
    }

    // First lesson of unit should be unlocked if last lesson of previous unit is completed
    if (lessonIndex === 0 && unitIndex > 0) {
      const previousUnit = language.units[unitIndex - 1];
      if (previousUnit && previousUnit.lessons.length > 0) {
        const lastLessonId =
          previousUnit.lessons[previousUnit.lessons.length - 1]?.id;
        if (lastLessonId && completedLessonIds.has(lastLessonId)) {
          return "unlocked";
        }
      }
      return "locked";
    }

    // Other lessons unlocked if previous lesson is completed
    const previousLesson = language.units[unitIndex]?.lessons[lessonIndex - 1];
    if (previousLesson && completedLessonIds.has(previousLesson.id)) {
      return "unlocked";
    }

    return "locked";
  };

  // Determine unlocked lessons
  const unlockedLessonIds = new Set<string>();
  language.units.forEach((unit, unitIndex) => {
    unit.lessons.forEach((lesson, lessonIndex) => {
      const status = getLessonStatus(unitIndex, lessonIndex);
      if (status === "unlocked" || completedLessonIds.has(lesson.id)) {
        unlockedLessonIds.add(lesson.id);
      }
    });
  });

  // Find current lesson (first unlocked and not completed)
  let currentLessonId: string | null = null;
  for (const unit of language.units) {
    for (const lesson of unit.lessons) {
      if (unlockedLessonIds.has(lesson.id) && !completedLessonIds.has(lesson.id)) {
        currentLessonId = lesson.id;
        break;
      }
    }
    if (currentLessonId) break;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Link href="/learn">
            <Button variant="ghost" className="mb-4 text-foreground-light hover:text-primary">
              ← Back to Languages
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{language.flagEmoji || "🏳️"}</span>
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                {language.name}
              </h1>
              <p className="text-lg text-foreground-light">{language.nativeName}</p>
            </div>
          </div>
        </div>

        {/* Stats Bar (Duolingo-style) */}
        <PathStatsBar
          streak={user?.currentStreak || 0}
          totalXP={user?.totalXP || 0}
          hearts={user?.hearts || 5}
          className="mb-6"
        />

        {/* Duolingo-style Learning Path - Code split and lazy loaded */}
        <Card className="p-8">
          <LearningPathErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <LearningPath
                units={language.units.map((unit) => ({
                  id: unit.id,
                  title: unit.title,
                  order: unit.order,
                  lessons: unit.lessons.map((lesson) => ({
                    id: lesson.id,
                    title: lesson.title,
                    xpReward: lesson.xpReward,
                    order: lesson.order,
                    type: lesson.type || "practice",
                  })),
                }))}
                completedLessonIds={completedLessonIds}
                unlockedLessonIds={unlockedLessonIds}
                languageCode={params.code}
                currentLessonId={currentLessonId}
                showBanners={true}
                bannerColors={["green", "purple", "teal", "blue"]}
                showProgressIndicators={true}
                mobileOptimized={true}
                enableSwipeNavigation={true}
              />
            </Suspense>
          </LearningPathErrorBoundary>
        </Card>

        {language.units.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-lg text-foreground-light">
                No lessons available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

