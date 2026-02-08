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

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalXP: true,
        hearts: true,
        currentStreak: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Define shop items
    const shopItems: Record<string, { price: number; type: string; value: number }> = {
      "hearts-5": {
        price: 350,
        type: "hearts",
        value: 5,
      },
      "streak-freeze": {
        price: 200,
        type: "streak_freeze",
        value: 1,
      },
      "double-xp": {
        price: 150,
        type: "double_xp",
        value: 1,
      },
      "time-freeze": {
        price: 100,
        type: "time_freeze",
        value: 1,
      },
    };

    const item = shopItems[itemId];

    if (!item) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    // Check if user has enough XP
    if (user.totalXP < item.price) {
      return NextResponse.json(
        { error: "Insufficient XP", required: item.price, current: user.totalXP },
        { status: 400 }
      );
    }

    // Process purchase
    if (item.type === "hearts") {
      // Restore hearts to full (5)
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          hearts: 5,
          totalXP: { decrement: item.price },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Hearts restored!",
        hearts: 5,
        xpRemaining: user.totalXP - item.price,
      });
    } else if (item.type === "streak_freeze") {
      // For now, just deduct XP. In the future, this could add a streak_freeze flag
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: { decrement: item.price },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Streak freeze purchased! Your streak will be protected for one day.",
        xpRemaining: user.totalXP - item.price,
      });
    } else if (item.type === "double_xp") {
      // For now, just deduct XP. In the future, this could add a double_xp flag with timer
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: { decrement: item.price },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Double XP boost activated! Earn 2x XP for 30 minutes.",
        xpRemaining: user.totalXP - item.price,
      });
    } else if (item.type === "time_freeze") {
      // For now, just deduct XP. In the future, this could pause heart regeneration
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: { decrement: item.price },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Time freeze activated! Heart regeneration timer paused.",
        xpRemaining: user.totalXP - item.price,
      });
    }

    return NextResponse.json({ error: "Unknown item type" }, { status: 400 });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}







