import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get("userId");
    if (!userId) {
      const session = await getServerSession(authOptions as any);
      userId = session?.user?.id || null;
    }
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const due = await prisma.flashcardProgress.findMany({
      where: { userId, nextReview: { lte: now } },
      include: { vocabulary: true },
      orderBy: { nextReview: "asc" },
      take: 30,
    });

    return NextResponse.json({ due });
  } catch (error) {
    console.error("/api/srs/due GET error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
