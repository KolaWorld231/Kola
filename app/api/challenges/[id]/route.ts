import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/challenges/[id] - Update challenge status (accept, decline, complete)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { id } = await params;
  const body = await request.json();
  const { action } = body; // accept, decline, complete

  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Check permissions
    if (action === "accept" || action === "decline") {
      if (challenge.receiverId !== session.user.id) {
        return NextResponse.json(
          { error: "Only the receiver can accept or decline" },
          { status: 403 }
        );
      }

      if (challenge.status !== "pending") {
        return NextResponse.json(
          { error: "Challenge is not pending" },
          { status: 400 }
        );
      }
    }

    if (action === "complete") {
      if (challenge.receiverId !== session.user.id) {
        return NextResponse.json(
          { error: "Only the receiver can complete the challenge" },
          { status: 403 }
        );
      }

      if (challenge.status !== "accepted") {
        return NextResponse.json(
          { error: "Challenge must be accepted first" },
          { status: 400 }
        );
      }

      // Verify challenge completion based on type
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          totalXP: true,
          currentStreak: true,
        },
      });

      let isCompleted = false;

      switch (challenge.type) {
        case "lesson":
          // Check if user completed the specific lesson
          if (challenge.target) {
            const progress = await prisma.userProgress.findUnique({
              where: {
                userId_lessonId: {
                  userId: session.user.id,
                  lessonId: challenge.target,
                },
              },
            });
            isCompleted = progress?.isCompleted || false;
          }
          break;

        case "xp":
          // Check if user earned the target XP since challenge was accepted
          const xpSinceAccept = await prisma.userXP.aggregate({
            where: {
              userId: session.user.id,
              createdAt: {
                gte: challenge.updatedAt, // XP earned since challenge was accepted
              },
            },
            _sum: { amount: true },
          });
          const targetXP = parseInt(challenge.target || "0");
          isCompleted = (xpSinceAccept._sum.amount || 0) >= targetXP;
          break;

        case "streak":
          // Check if user reached the target streak
          const targetStreak = parseInt(challenge.target || "0");
          isCompleted = (user?.currentStreak || 0) >= targetStreak;
          break;

        case "accuracy":
          // Check if user achieved target accuracy in recent lessons
          const targetAccuracy = parseFloat(challenge.target || "0");
          const recentProgress = await prisma.userProgress.findMany({
            where: {
              userId: session.user.id,
              completedAt: {
                gte: challenge.updatedAt,
              },
              isCompleted: true,
            },
            take: 10,
          });
          if (recentProgress.length > 0) {
            const avgAccuracy =
              recentProgress.reduce((sum, p) => sum + (p.accuracy || 0), 0) /
              recentProgress.length;
            isCompleted = avgAccuracy >= targetAccuracy;
          }
          break;

        default:
          // For unknown types, allow manual completion
          isCompleted = true;
      }

      if (!isCompleted) {
        return NextResponse.json(
          {
            error: "Challenge requirements not met yet",
            details: `You haven't completed the ${challenge.type} challenge requirements.`,
          },
          { status: 400 }
        );
      }
    }

    const updateData: {
      status: string;
      completedAt?: Date;
    } = {
      status: "pending",
    };

    if (action === "accept") {
      updateData.status = "accepted";
    } else if (action === "decline") {
      updateData.status = "declined";
    } else if (action === "complete") {
      updateData.status = "completed";
      updateData.completedAt = new Date();
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create social activity when challenge is completed
    if (action === "complete") {
      await prisma.socialActivity.create({
        data: {
          userId: session.user.id,
          type: "challenge_won",
          title: "Challenge Completed! 🏆",
          message: `${challenge.receiver.name} completed ${challenge.sender.name}'s challenge!`,
          data: {
            challengeId: challenge.id,
            challengeType: challenge.type,
            senderId: challenge.senderId,
          },
          isPublic: true,
        },
      });
    }

    return NextResponse.json({ challenge: updated });
  } catch (error) {
    console.error("Error updating challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

