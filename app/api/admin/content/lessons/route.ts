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

    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { unitId, title, description, type, xpReward, order } = await request.json();

    if (!unitId || !title) {
      return NextResponse.json(
        { error: "unitId and title are required" },
        { status: 400 }
      );
    }

    // Get max order for this unit
    const maxOrder = await prisma.lesson.findFirst({
      where: { unitId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = order !== undefined ? order : (maxOrder?.order || 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        unitId,
        title,
        description: description || null,
        type: type || "practice",
        xpReward: xpReward || 10,
        order: newOrder,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}







