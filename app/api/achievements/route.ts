import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// GET /api/achievements - list achievements and unlocked for user (optional userId)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get("userId");
    if (!userId) {
      const session = await getServerSession(authOptions as any);
      userId = session?.user?.id || null;
    }

    const achievements = await prisma.achievement.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });

    if (!userId) {
      return NextResponse.json({ achievements });
    }

    const unlocked = await prisma.userAchievement.findMany({ where: { userId } });
    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

    const withState = achievements.map((a) => ({ ...a, unlocked: unlockedIds.has(a.id) }));
    return NextResponse.json({ achievements: withState });
  } catch (error) {
    console.error("/api/achievements GET error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/achievements - unlock achievement for user (prefers session user)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const body = await request.json();
    const { userId: bodyUserId, achievementCode } = body;
    const userId = bodyUserId || session?.user?.id;

    if (!userId || !achievementCode) {
      return NextResponse.json({ error: "userId and achievementCode required" }, { status: 400 });
    }

    const achievement = await prisma.achievement.findUnique({ where: { code: achievementCode } });
    if (!achievement) {
      return NextResponse.json({ error: "Unknown achievement" }, { status: 404 });
    }

    // create if not exists
    const existing = await prisma.userAchievement.findFirst({ where: { userId, achievementId: achievement.id } });
    if (existing) return NextResponse.json({ unlocked: true });

    await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
    // optionally add XP
    await prisma.user.update({ where: { id: userId }, data: { totalXP: { increment: achievement.xpReward } } as any });

    return NextResponse.json({ unlocked: true });
  } catch (error) {
    console.error("/api/achievements POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
