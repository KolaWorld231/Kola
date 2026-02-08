import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * Get exercises for review practice mode
 * Returns exercises from previously completed lessons that user got wrong or struggled with
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get("languageId");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get user's progress with low accuracy or multiple attempts
    const weakLessons = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true,
        ...(languageId && {
          lesson: {
            unit: {
              languageId,
            },
          },
        }),
        OR: [
          { accuracy: { lt: 80 } }, // Less than 80% accuracy
          { attempts: { gt: 1 } }, // Multiple attempts
        ],
      },
      include: {
        lesson: {
          include: {
            exercises: {
              include: {
                options: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 5, // Get 5 recent weak lessons
    });

    // Collect exercises from these lessons
    const exercises: Array<{
      id: string;
      type: string;
      question: string;
      correctAnswer: string;
      xpReward: number;
      options?: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
      }>;
      lessonTitle: string;
      lessonId: string;
    }> = [];

    for (const progress of weakLessons) {
      for (const exercise of progress.lesson.exercises) {
        exercises.push({
          id: exercise.id,
          type: exercise.type,
          question: exercise.question,
          correctAnswer: exercise.correctAnswer,
          xpReward: exercise.xpReward,
          options: exercise.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
          lessonTitle: progress.lesson.title,
          lessonId: progress.lesson.id,
        });
      }
    }

    // Shuffle and limit exercises
    const shuffled = exercises.sort(() => Math.random() - 0.5);
    const reviewExercises = shuffled.slice(0, limit);

    return NextResponse.json({
      exercises: reviewExercises,
      count: reviewExercises.length,
    });
  } catch (error) {
    console.error("Error fetching review exercises:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}







