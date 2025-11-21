import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * API route to claim unit completion bonus
 * Awards bonus XP when user completes all lessons in a unit
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const unitId = resolvedParams.id;

    // Get unit with lessons
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        lessons: {
          select: { id: true },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Check if user has completed all lessons in this unit
    const completedLessons = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: unit.lessons.map((l) => l.id) },
        isCompleted: true,
      },
    });

    const allLessonsCompleted = unit.lessons.every((lesson) =>
      completedLessons.some((progress) => progress.lessonId === lesson.id)
    );

    if (!allLessonsCompleted) {
      return NextResponse.json(
        { error: "Unit not completed" },
        { status: 400 }
      );
    }

    // Check if bonus already claimed
    const existingBonus = await prisma.userXP.findFirst({
      where: {
        userId: session.user.id,
        source: "unit_bonus",
        sourceId: unitId,
      },
    });

    if (existingBonus) {
      return NextResponse.json(
        { error: "Bonus already claimed", success: false },
        { status: 400 }
      );
    }

    // Award bonus XP (default: 50 XP)
    const bonusXP = 50;

    await prisma.userXP.create({
      data: {
        userId: session.user.id,
        amount: bonusXP,
        source: "unit_bonus",
        sourceId: unitId,
        description: `Unit bonus: ${unit.title}`,
      },
    });

    // Update user's total XP
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalXP: { increment: bonusXP },
      },
    });

    // Update leaderboard (don't await to avoid blocking)
    const { updateLeaderboard } = await import("@/lib/leaderboard");
    updateLeaderboard(session.user.id, bonusXP, null).catch(console.error);

    return NextResponse.json({
      success: true,
      bonusXP,
      message: `Bonus claimed! +${bonusXP} XP earned!`,
    });
  } catch (error) {
    console.error("Error claiming unit bonus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

