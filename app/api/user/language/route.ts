import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { languageId } = body;

    if (!languageId) {
      return NextResponse.json(
        { error: "Language ID is required" },
        { status: 400 }
      );
    }

    // Verify language exists
    const language = await prisma.language.findUnique({
      where: { id: languageId, isActive: true },
    });

    if (!language) {
      return NextResponse.json(
        { error: "Language not found or inactive" },
        { status: 404 }
      );
    }

    // Update user's selected language
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { selectedLanguageId: languageId },
      select: {
        id: true,
        selectedLanguageId: true,
        selectedLanguage: {
          select: {
            id: true,
            code: true,
            name: true,
            nativeName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      language: updatedUser.selectedLanguage,
    });
  } catch (error) {
    console.error("Error updating user language:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






