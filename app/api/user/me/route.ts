import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/user/me - Get current user information
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        selectedLanguageId: true,
        totalXP: true,
        currentStreak: true,
        longestStreak: true,
        hearts: true,
        createdAt: true,
        selectedLanguage: {
          select: {
            id: true,
            code: true,
            name: true,
            nativeName: true,
            flagEmoji: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(session.user.id);

    return NextResponse.json({ 
      ...user,
      isAdmin: userIsAdmin,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
