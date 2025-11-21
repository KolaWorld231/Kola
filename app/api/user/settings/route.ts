import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/settings - Get user settings
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/settings - Update user settings
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get or create user settings
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    let settings;
    if (existingSettings) {
      settings = await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: {
          // Lesson Experience
          soundEffects: body.soundEffects !== undefined ? body.soundEffects : existingSettings.soundEffects,
          animations: body.animations !== undefined ? body.animations : existingSettings.animations,
          motivationalMessages: body.motivationalMessages !== undefined ? body.motivationalMessages : existingSettings.motivationalMessages,
          listeningExercises: body.listeningExercises !== undefined ? body.listeningExercises : existingSettings.listeningExercises,
          
          // Appearance
          darkMode: body.darkMode !== undefined ? body.darkMode : existingSettings.darkMode,
          
          // Notifications - General
          emailProductUpdates: body.emailProductUpdates !== undefined ? body.emailProductUpdates : existingSettings.emailProductUpdates,
          emailNewFollower: body.emailNewFollower !== undefined ? body.emailNewFollower : existingSettings.emailNewFollower,
          emailFriendActivity: body.emailFriendActivity !== undefined ? body.emailFriendActivity : existingSettings.emailFriendActivity,
          emailWeeklyProgress: body.emailWeeklyProgress !== undefined ? body.emailWeeklyProgress : existingSettings.emailWeeklyProgress,
          emailSpecialPromotions: body.emailSpecialPromotions !== undefined ? body.emailSpecialPromotions : existingSettings.emailSpecialPromotions,
          emailResearchOpportunities: body.emailResearchOpportunities !== undefined ? body.emailResearchOpportunities : existingSettings.emailResearchOpportunities,
          
          // Notifications - Daily Reminders
          emailPracticeReminder: body.emailPracticeReminder !== undefined ? body.emailPracticeReminder : existingSettings.emailPracticeReminder,
          practiceReminderTime: body.practiceReminderTime !== undefined ? body.practiceReminderTime : existingSettings.practiceReminderTime,
          
          // Privacy
          profilePublic: body.profilePublic !== undefined ? body.profilePublic : existingSettings.profilePublic,
          personalizedAds: body.personalizedAds !== undefined ? body.personalizedAds : existingSettings.personalizedAds,
          friendStreaks: body.friendStreaks !== undefined ? body.friendStreaks : existingSettings.friendStreaks,
          
          // Profile
          username: body.username !== undefined ? body.username : existingSettings.username,
        },
      });
    } else {
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          ...body,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






