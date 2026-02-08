import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

/**
 * Skip onboarding - marks onboarding as completed with default values
 * Only available for non-admin users
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin - admins cannot skip onboarding
    const userIsAdmin = await isAdmin(session.user.id);
    if (userIsAdmin) {
      return NextResponse.json(
        { error: "Admin users must complete onboarding" },
        { status: 403 }
      );
    }

    // Get the first available language as default
    const defaultLanguage = await prisma.language.findFirst({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    if (!defaultLanguage) {
      return NextResponse.json(
        { error: "No languages available. Please complete onboarding manually." },
        { status: 400 }
      );
    }

    // Mark onboarding as completed with default values
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        assessmentCompleted: true,
        assessmentLanguageId: defaultLanguage.id,
        assessmentLevel: "beginner",
        assessmentTribe: null,
        assessmentLearningGoals: null,
        assessmentDailyGoal: 50,
        assessmentCompletedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        assessmentCompleted: true,
        assessmentLanguageId: defaultLanguage.id,
        assessmentLevel: "beginner",
        assessmentTribe: null,
        assessmentLearningGoals: null,
        assessmentDailyGoal: 50,
        assessmentCompletedAt: new Date(),
      },
    });

    // Update user's selected language
    await prisma.user.update({
      where: { id: session.user.id },
      data: { selectedLanguageId: defaultLanguage.id },
    });

    return NextResponse.json({
      message: "Onboarding skipped successfully",
      languageId: defaultLanguage.id,
    });
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    return NextResponse.json(
      { error: "Failed to skip onboarding. Please try again." },
      { status: 500 }
    );
  }
}

