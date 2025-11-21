import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { MAX_HEARTS, calculateHeartRecovery } from "@/lib/hearts";

/**
 * Recover hearts based on time elapsed
 * Automatically called when checking user status
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        hearts: true,
        lastActivityDate: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use lastActivityDate or updatedAt as last heart loss time
    // In production, you'd track lastHeartLossTime separately
    const lastHeartLossTime = user.lastActivityDate || user.updatedAt;
    const now = new Date();

    const recoveryInfo = calculateHeartRecovery(
      user.hearts,
      lastHeartLossTime,
      now
    );

    // If hearts can be recovered, update user
    if (recoveryInfo.heartsToRecover > 0) {
      const newHearts = Math.min(
        user.hearts + recoveryInfo.heartsToRecover,
        MAX_HEARTS
      );

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          hearts: newHearts,
        },
        select: {
          hearts: true,
        },
      });

      return NextResponse.json({
        hearts: updatedUser.hearts,
        heartsRecovered: recoveryInfo.heartsToRecover,
        maxHearts: MAX_HEARTS,
        nextRecoveryTime: recoveryInfo.nextRecoveryTime,
        timeUntilNextHeart: recoveryInfo.timeUntilNextHeart,
        message: `Recovered ${recoveryInfo.heartsToRecover} heart(s)`,
      });
    }

    return NextResponse.json({
      hearts: user.hearts,
      heartsRecovered: 0,
      maxHearts: MAX_HEARTS,
      nextRecoveryTime: recoveryInfo.nextRecoveryTime,
      timeUntilNextHeart: recoveryInfo.timeUntilNextHeart,
      message: "No hearts to recover yet",
    });
  } catch (error) {
    console.error("Error recovering hearts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Watch ad to recover hearts immediately
 */
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        hearts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.hearts >= MAX_HEARTS) {
      return NextResponse.json({
        hearts: user.hearts,
        message: "Hearts are already full",
      });
    }

    // Recover 1 heart per ad watched
    const newHearts = Math.min(user.hearts + 1, MAX_HEARTS);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hearts: newHearts,
      },
      select: {
        hearts: true,
      },
    });

    // In production, you'd track ad watches here
    // For now, we'll just return the updated hearts

    return NextResponse.json({
      hearts: updatedUser.hearts,
      heartsRecovered: 1,
      maxHearts: MAX_HEARTS,
      message: "Heart recovered by watching ad",
    });
  } catch (error) {
    console.error("Error recovering hearts via ad:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

