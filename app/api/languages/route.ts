import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/languages - Get all active languages
 */
export async function GET(_request: Request) {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        nativeName: true,
        flagEmoji: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Add caching headers for static content
    // Languages rarely change, so cache for 30 minutes
    return NextResponse.json(
      { languages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




