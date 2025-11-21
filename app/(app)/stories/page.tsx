import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";
import { StoriesClient } from "@/components/stories/stories-client";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Get all stories with their lessons and languages
  const stories = await prisma.story.findMany({
    include: {
      lesson: {
        include: {
          unit: {
            include: {
              language: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  nativeName: true,
                  flagEmoji: true,
                },
              },
            },
          },
        },
      },
      questions: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get user's completed lessons
  const userProgress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      isCompleted: true,
    },
    select: {
      lessonId: true,
    },
  });

  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  // Get available languages for filter
  const languages = await prisma.language.findMany({
    where: {
      isActive: true,
      units: {
        some: {
          lessons: {
            some: {
              story: {
                isNot: null,
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      code: true,
      name: true,
      flagEmoji: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-liberian-red mb-2 flex items-center gap-3">
            <BookOpen className="h-10 w-10" />
            Story Mode 📚
          </h1>
          <p className="text-lg text-gray-600">
            Read stories in Liberian languages and test your comprehension
          </p>
        </div>

        {/* Stories Grid */}
        <StoriesClient
          stories={stories.map((story) => ({
            id: story.id,
            title: story.title,
            content: story.content,
            translation: story.translation,
            audioUrl: story.audioUrl,
            difficulty: story.difficulty,
            questionCount: story._count.questions,
            language: {
              id: story.lesson.unit.language.id,
              code: story.lesson.unit.language.code,
              name: story.lesson.unit.language.name,
              nativeName: story.lesson.unit.language.nativeName || undefined,
              flagEmoji: story.lesson.unit.language.flagEmoji || undefined,
            },
            lesson: {
              id: story.lesson.id,
              title: story.lesson.title,
              unitTitle: story.lesson.unit.title,
            },
            isUnlocked: completedLessonIds.has(story.lesson.id),
          }))}
          languages={languages}
        />
      </div>
    </div>
  );
}

