import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// GET /api/streaks - return user streaks (query by userId or session)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get("userId");

    if (!userId) {
      const session = await getServerSession(authOptions as any);
      userId = session?.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 401 });
    }

    const streak = await prisma.userStreak.findFirst({ where: { userId } });
    return NextResponse.json({ streak });
  } catch (error) {
    console.error("/api/streaks GET error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/streaks - update or create a user streak; prefers session user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const body = await request.json();
    let { userId, languageId, increment = 1 } = body;

    userId = userId || session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 401 });
    }

    const existing = await prisma.userStreak.findFirst({ where: { userId, languageId } });
    if (!existing) {
      const created = await prisma.userStreak.create({ data: { userId, languageId, currentStreak: increment, totalDays: 1 } });
      return NextResponse.json({ streak: created });
    }

    const updated = await prisma.userStreak.update({
      where: { id: existing.id },
      data: {
        currentStreak: existing.currentStreak + increment,
        totalDays: existing.totalDays + 1,
        longestStreak: Math.max(existing.longestStreak, existing.currentStreak + increment),
      },
    });

    return NextResponse.json({ streak: updated });
  } catch (error) {
    console.error("/api/streaks POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
