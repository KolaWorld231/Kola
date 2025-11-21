import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/progress - Get user's learning progress
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get("languageId");

    // Get user progress
    const progress = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        ...(languageId
          ? {
              lesson: {
                unit: {
                  languageId,
                },
              },
            }
          : {}),
      },
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
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calculate statistics
    const totalLessons = progress.length;
    const completedLessons = progress.filter((p) => p.isCompleted).length;
    const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);
    const totalCorrect = progress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const totalQuestions = progress.reduce((sum, p) => sum + p.totalQuestions, 0);
    const averageAccuracy =
      totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // Group by language
    const byLanguage = progress.reduce((acc, p) => {
      const langId = p.lesson.unit.language.id;
      if (!acc[langId]) {
        acc[langId] = {
          language: p.lesson.unit.language,
          total: 0,
          completed: 0,
          accuracy: 0,
        };
      }
      acc[langId].total++;
      if (p.isCompleted) acc[langId].completed++;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      progress,
      statistics: {
        totalLessons,
        completedLessons,
        totalAttempts,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        byLanguage: Object.values(byLanguage),
      },
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




