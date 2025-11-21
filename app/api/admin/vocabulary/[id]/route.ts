import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const {
      languageId,
      word,
      translation,
      phonetic,
      audioUrl,
      imageUrl,
      category,
      difficulty,
    } = body;

    if (!word || !translation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const vocabulary = await prisma.vocabulary.update({
      where: { id: params.id },
      data: {
        ...(languageId && { languageId }),
        word,
        translation,
        phonetic: phonetic || null,
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null,
        category: category || null,
        difficulty: difficulty || "easy",
      },
      include: {
        language: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ vocabulary });
  } catch (error) {
    console.error("Error updating vocabulary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.vocabulary.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vocabulary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






