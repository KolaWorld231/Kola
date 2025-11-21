import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/courses - Get user's enrolled languages
 * A user is considered "enrolled" in a language if:
 * 1. It's their selected language, OR
 * 2. They have progress in lessons for that language
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's selected language
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedLanguageId: true },
    });

    // Optimize: Get unique language IDs directly without fetching full language data
    const progressLanguages = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        lesson: {
          select: {
            unit: {
              select: {
                languageId: true,
              },
            },
          },
        },
      },
      distinct: ["lessonId"],
    });

    // Extract unique language IDs
    const languageIds = new Set<string>();
    if (user?.selectedLanguageId) {
      languageIds.add(user.selectedLanguageId);
    }

    progressLanguages.forEach((progress) => {
      const langId = progress.lesson.unit.languageId;
      if (langId) {
        languageIds.add(langId);
      }
    });

    // Fetch all enrolled languages only if we have IDs
    // Optimize: Only fetch what we need, and only if there are language IDs
    const enrolledLanguages = languageIds.size > 0
      ? await prisma.language.findMany({
          where: {
            id: { in: Array.from(languageIds) },
            isActive: true,
          },
          select: {
            id: true,
            code: true,
            name: true,
            nativeName: true,
            flagEmoji: true,
          },
          orderBy: {
            name: "asc",
          },
        })
      : [];

    return NextResponse.json({
      languages: enrolledLanguages,
      selectedLanguageId: user?.selectedLanguageId || null,
    });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




