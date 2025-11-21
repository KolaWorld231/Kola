import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      lessonId,
      type,
      question,
      correctAnswer,
      questionAudio,
      questionImage,
      grammarTip,
      xpReward,
      difficulty,
      order,
      options,
    } = await request.json();

    if (!lessonId || !type || !question || !correctAnswer) {
      return NextResponse.json(
        { error: "lessonId, type, question, and correctAnswer are required" },
        { status: 400 }
      );
    }

    // Get max order for this lesson
    const maxOrder = await prisma.exercise.findFirst({
      where: { lessonId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = order !== undefined ? order : (maxOrder?.order || 0) + 1;

    const exercise = await prisma.exercise.create({
      data: {
        lessonId,
        type,
        question,
        correctAnswer,
        questionAudio: questionAudio || null,
        questionImage: questionImage || null,
        grammarTip: grammarTip || null,
        xpReward: xpReward || 5,
        difficulty: difficulty || "easy",
        order: newOrder,
      },
    });

    // Create exercise options if provided (for multiple choice, etc.)
    if (options && Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        await prisma.exerciseOption.create({
          data: {
            exerciseId: exercise.id,
            text: option.text || "",
            audioUrl: option.audioUrl || null,
            imageUrl: option.imageUrl || null,
            isCorrect: option.isCorrect || false,
            order: i + 1,
          },
        });
      }
    }

    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

