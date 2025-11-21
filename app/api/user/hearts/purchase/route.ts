import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { MAX_HEARTS } from "@/lib/hearts";

/**
 * POST /api/user/hearts/purchase
 * Purchase hearts with in-app currency or real money
 * 
 * Query params:
 * - amount: number of hearts to purchase (default: 1)
 * 
 * In production, this would integrate with payment services:
 * - Stripe for real money purchases
 * - In-app currency system
 * - Apple/Google in-app purchases
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const amount = parseInt(searchParams.get("amount") || "1", 10);

    if (amount < 1 || amount > 5) {
      return NextResponse.json(
        { error: "Amount must be between 1 and 5" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        hearts: true,
        totalXP: true,
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

    // Calculate hearts to add (don't exceed max)
    const heartsToAdd = Math.min(amount, MAX_HEARTS - user.hearts);
    if (heartsToAdd <= 0) {
      return NextResponse.json(
        { error: "Cannot add hearts - already at maximum" },
        { status: 400 }
      );
    }

    // For now, use XP as currency (100 XP per heart)
    // In production, integrate with payment system
    const XP_COST_PER_HEART = 100;
    const totalCost = heartsToAdd * XP_COST_PER_HEART;

    if (user.totalXP < totalCost) {
      return NextResponse.json(
        {
          error: `Not enough XP. Need ${totalCost} XP (you have ${user.totalXP})`,
          requiredXP: totalCost,
          currentXP: user.totalXP,
          heartsToAdd,
        },
        { status: 400 }
      );
    }

    // Deduct XP and add hearts
    const newHearts = user.hearts + heartsToAdd;
    const newXP = user.totalXP - totalCost;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hearts: newHearts,
        totalXP: newXP,
      },
      select: {
        hearts: true,
        totalXP: true,
      },
    });

    // Log XP transaction
    await prisma.userXP.create({
      data: {
        userId: session.user.id,
        amount: -totalCost,
        source: "purchase",
        sourceId: "hearts",
        description: `Purchased ${heartsToAdd} heart(s)`,
      },
    });

    // In production, you would:
    // 1. Integrate with payment service (Stripe, Apple Pay, Google Pay)
    // 2. Verify payment before awarding hearts
    // 3. Track purchases for analytics
    // 4. Support multiple payment methods

    return NextResponse.json({
      success: true,
      hearts: updatedUser.hearts,
      heartsPurchased: heartsToAdd,
      xpSpent: totalCost,
      remainingXP: updatedUser.totalXP,
      maxHearts: MAX_HEARTS,
      message: `Purchased ${heartsToAdd} heart(s) for ${totalCost} XP`,
    });
  } catch (error: unknown) {
    console.error("Error purchasing hearts:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


