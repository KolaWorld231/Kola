import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/languages/[code]/tree - Get language learning tree with user progress
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { code } = await params;

    const language = await prisma.language.findUnique({
      where: { code },
      include: {
        units: {
          include: {
            lessons: {
              include: {
                progress: session?.user?.id
                  ? {
                      where: { userId: session.user.id },
                    }
                  : false,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Calculate progress for each unit and lesson
    const tree = {
      ...language,
      units: language.units.map((unit) => {
        const lessonsWithProgress = unit.lessons.map((lesson) => {
          const userProgress = session?.user?.id
            ? lesson.progress?.find((p) => p.userId === session.user.id)
            : null;

          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
            type: lesson.type,
            xpReward: lesson.xpReward,
            isCompleted: userProgress?.isCompleted || false,
            accuracy: userProgress?.accuracy || null,
            attempts: userProgress?.attempts || 0,
            isLocked: false, // Can be calculated based on previous lesson completion
          };
        });

        // Calculate unit progress
        const completedLessons = lessonsWithProgress.filter((l) => l.isCompleted).length;
        const totalLessons = lessonsWithProgress.length;
        const unitProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Determine if lessons are locked (first lesson unlocked, others require previous completion)
        const lessonsWithLockStatus = lessonsWithProgress.map((lesson, index) => {
          if (index === 0) {
            return { ...lesson, isLocked: false };
          }
          const previousLesson = lessonsWithProgress[index - 1];
          return {
            ...lesson,
            isLocked: !previousLesson.isCompleted,
          };
        });

        return {
          id: unit.id,
          title: unit.title,
          description: unit.description,
          order: unit.order,
          difficulty: unit.difficulty,
          isLocked: unit.isLocked,
          progress: Math.round(unitProgress * 100) / 100,
          completedLessons,
          totalLessons,
          lessons: lessonsWithLockStatus,
        };
      }),
    };

    return NextResponse.json({ language: tree });
  } catch (error) {
    console.error("Error fetching language tree:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





