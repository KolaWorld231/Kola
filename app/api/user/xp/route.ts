import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/xp - Get user's XP history
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const source = searchParams.get("source"); // Optional filter by source

    // Get XP entries
    const xpEntries = await prisma.userXP.findMany({
      where: {
        userId: session.user.id,
        ...(source ? { source } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Calculate statistics
    const totalXP = await prisma.userXP.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true },
    });

    const bySource = await prisma.userXP.groupBy({
      by: ["source"],
      where: { userId: session.user.id },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Get user's current total XP
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { totalXP: true },
    });

    return NextResponse.json({
      entries: xpEntries,
      totalXP: user?.totalXP || 0,
      calculatedTotal: totalXP._sum.amount || 0,
      bySource: bySource.map((item) => ({
        source: item.source,
        totalXP: item._sum.amount || 0,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching XP history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





