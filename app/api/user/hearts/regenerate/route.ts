import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * Hearts regeneration system:
 * - 1 heart regenerates every 30 minutes (or can be set to different interval)
 * - Maximum 5 hearts
 * - Hearts regenerate automatically when user makes a request if enough time has passed
 */
const HEART_REGENERATION_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_HEARTS = 5;

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

    // If hearts are already full, no need to regenerate
    if (user.hearts >= MAX_HEARTS) {
      return NextResponse.json({
        hearts: user.hearts,
        maxHearts: MAX_HEARTS,
        nextRegeneration: null,
        message: "Hearts are full",
      });
    }

    // Calculate how many hearts should have regenerated
    const now = new Date();
    const lastUpdate = user.lastActivityDate || user.updatedAt;
    const timeSinceLastUpdate = now.getTime() - lastUpdate.getTime();
    const heartsToRegenerate = Math.floor(
      timeSinceLastUpdate / HEART_REGENERATION_INTERVAL_MS
    );

    if (heartsToRegenerate > 0) {
      const newHearts = Math.min(user.hearts + heartsToRegenerate, MAX_HEARTS);
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          hearts: newHearts,
        },
      });

      const heartsRegenerated = newHearts - user.hearts;
      const timeUntilNextHeart =
        heartsRegenerated < heartsToRegenerate
          ? HEART_REGENERATION_INTERVAL_MS
          : HEART_REGENERATION_INTERVAL_MS -
            (timeSinceLastUpdate % HEART_REGENERATION_INTERVAL_MS);

      return NextResponse.json({
        hearts: updatedUser.hearts,
        maxHearts: MAX_HEARTS,
        heartsRegenerated,
        nextRegeneration: new Date(now.getTime() + timeUntilNextHeart),
        message: `Regenerated ${heartsRegenerated} heart(s)`,
      });
    }

    // Calculate time until next regeneration
    const timeUntilNextHeart =
      HEART_REGENERATION_INTERVAL_MS -
      (timeSinceLastUpdate % HEART_REGENERATION_INTERVAL_MS);

    return NextResponse.json({
      hearts: user.hearts,
      maxHearts: MAX_HEARTS,
      nextRegeneration: new Date(now.getTime() + timeUntilNextHeart),
      message: "No hearts to regenerate yet",
    });
  } catch (error) {
    console.error("Error regenerating hearts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

