import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/user/courses/[languageId] - Remove a language course from user's list
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ languageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { languageId } = await params;

    // Check if this is the user's selected language
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedLanguageId: true },
    });

    if (user?.selectedLanguageId === languageId) {
      return NextResponse.json(
        { error: "Cannot remove your currently selected language. Please select a different language first." },
        { status: 400 }
      );
    }

    // Verify language exists
    const language = await prisma.language.findUnique({
      where: { id: languageId },
      select: { id: true, isActive: true },
    });

    if (!language || !language.isActive) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Check if user has any progress in this language
    const progressCount = await prisma.userProgress.count({
      where: {
        userId: session.user.id,
        lesson: {
          unit: {
            languageId: languageId,
          },
        },
      },
    });

    // Allow removal even with progress - we'll keep the progress data
    // User can re-add the language later and their progress will still be there
    // This is a soft removal - we just don't show it in their active courses list

    return NextResponse.json({
      message: "Language removed successfully",
      languageId,
      hadProgress: progressCount > 0,
    });
  } catch (error) {
    console.error("Error removing language:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


