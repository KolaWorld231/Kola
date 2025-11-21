import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/languages/[id] - Update language (activate/deactivate)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    // Validate input
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Verify language exists
    const existingLanguage = await prisma.language.findUnique({
      where: { id },
    });

    if (!existingLanguage) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    // Update language status
    const updatedLanguage = await prisma.language.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        code: true,
        name: true,
        nativeName: true,
        flagEmoji: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(
      `[ADMIN] Language ${updatedLanguage.code} ${isActive ? "activated" : "deactivated"} by admin ${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      language: updatedLanguage,
      message: `Language ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating language:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/languages/[id] - Get language details
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const language = await prisma.language.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        nativeName: true,
        flagEmoji: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
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

