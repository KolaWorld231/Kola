import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/languages/[code] - Get language by code
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const language = await prisma.language.findUnique({
      where: { code },
      include: {
        units: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
                type: true,
                xpReward: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    return NextResponse.json({ language });
  } catch (error) {
    console.error("Error fetching language:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





