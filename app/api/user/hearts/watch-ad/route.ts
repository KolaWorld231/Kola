import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { MAX_HEARTS } from "@/lib/hearts";

/**
 * POST /api/user/hearts/watch-ad
 * Watch an ad to recover one heart immediately
 * 
 * In production, this would integrate with an ad service (Google AdMob, etc.)
 * For now, it simulates watching an ad and awards one heart
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
        id: true,
        hearts: true,
        lastAdWatchTime: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if hearts are already full
    if (user.hearts >= MAX_HEARTS) {
      return NextResponse.json(
        { error: "Your hearts are already full!" },
        { status: 400 }
      );
    }

    // Check if user has watched an ad recently (rate limiting)
    // Allow one ad per hour
    const AD_WATCH_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
    if (user.lastAdWatchTime) {
      const lastWatchTime = new Date(user.lastAdWatchTime);
      const timeSinceLastAd = new Date().getTime() - lastWatchTime.getTime();
      if (timeSinceLastAd < AD_WATCH_COOLDOWN_MS) {
        const remainingCooldown = AD_WATCH_COOLDOWN_MS - timeSinceLastAd;
        const minutesRemaining = Math.ceil(remainingCooldown / (60 * 1000));
        return NextResponse.json(
          {
            error: `Please wait ${minutesRemaining} minute(s) before watching another ad`,
            cooldownRemaining: remainingCooldown,
          },
          { status: 429 }
        );
      }
    }

    // Award one heart
    const newHearts = Math.min(user.hearts + 1, MAX_HEARTS);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hearts: newHearts,
        lastAdWatchTime: new Date(),
      },
      select: {
        hearts: true,
        lastAdWatchTime: true,
      },
    });

    // In production, you would:
    // 1. Integrate with ad service (Google AdMob, Unity Ads, etc.)
    // 2. Verify ad completion before awarding heart
    // 3. Track ad views for analytics
    // 4. Potentially award bonus XP for watching ads

    return NextResponse.json({
      success: true,
      hearts: updatedUser.hearts,
      heartsRecovered: newHearts - user.hearts,
      maxHearts: MAX_HEARTS,
      message: "Heart recovered! Thank you for watching.",
    });
  } catch (error: unknown) {
    console.error("Error processing ad watch:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

