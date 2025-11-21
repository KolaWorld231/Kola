import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/assessment/status - Check if user has completed assessment
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      completed: userSettings?.assessmentCompleted || false,
    });
  } catch (error) {
    console.error("Error checking assessment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




