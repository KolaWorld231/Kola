import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const vocabularies = await prisma.vocabulary.findMany({
      include: {
        language: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        { language: { name: "asc" } },
        { category: "asc" },
        { word: "asc" },
      ],
    });

    return NextResponse.json({ vocabularies });
  } catch (error) {
    console.error("Error fetching vocabularies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const {
      languageId,
      word,
      translation,
      phonetic,
      audioUrl,
      imageUrl,
      category,
      difficulty = "easy",
    } = body;

    if (!languageId || !word || !translation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const vocabulary = await prisma.vocabulary.create({
      data: {
        languageId,
        word,
        translation,
        phonetic,
        audioUrl,
        imageUrl,
        category,
        difficulty,
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

    return NextResponse.json({ vocabulary }, { status: 201 });
  } catch (error) {
    console.error("Error creating vocabulary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






