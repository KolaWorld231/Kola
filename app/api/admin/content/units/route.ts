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

    const { languageId, title, description, difficulty, order } = await request.json();

    if (!languageId || !title) {
      return NextResponse.json(
        { error: "languageId and title are required" },
        { status: 400 }
      );
    }

    // Get max order for this language
    const maxOrder = await prisma.unit.findFirst({
      where: { languageId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = order !== undefined ? order : (maxOrder?.order || 0) + 1;

    const unit = await prisma.unit.create({
      data: {
        languageId,
        title,
        description: description || null,
        difficulty: difficulty || "beginner",
        order: newOrder,
        isLocked: true, // New units start locked
      },
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






