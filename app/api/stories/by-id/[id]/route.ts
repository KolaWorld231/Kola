import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const story = await prisma.story.findUnique({
      where: { id: resolvedParams.id },
      include: {
        lesson: {
          include: {
            unit: {
              include: {
                language: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
        questions: {
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      story: {
        id: story.id,
        title: story.title,
        content: story.content,
        translation: story.translation,
        audioUrl: story.audioUrl,
        difficulty: story.difficulty,
        lesson: {
          id: story.lesson.id,
          title: story.lesson.title,
          unit: {
            language: {
              code: story.lesson.unit.language.code,
            },
          },
        },
        questions: story.questions.map((q) => ({
          id: q.id,
          question: q.question,
          correctAnswer: q.correctAnswer,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}







