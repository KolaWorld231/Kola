import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/export-data - Export user data
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        selectedLanguage: true,
        progress: {
          include: {
            lesson: {
              include: {
                unit: {
                  include: {
                    language: true,
                  },
                },
              },
            },
          },
        },
        xpEntries: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
        dailyChallenges: {
          include: {
            challenge: true,
          },
        },
        settings: true,
        sentFriendRequests: {
          include: {
            friend: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        receivedFriendRequests: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive data
    const exportData = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      selectedLanguage: user.selectedLanguage,
      progress: user.progress.map((p) => ({
        lesson: p.lesson.title,
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
        accuracy: p.accuracy,
        attempts: p.attempts,
      })),
      xpEntries: user.xpEntries,
      achievements: user.achievements.map((ua) => ({
        name: ua.achievement.name,
        description: ua.achievement.description,
        unlockedAt: ua.unlockedAt,
      })),
      dailyChallenges: user.dailyChallenges.map((udc) => ({
        type: udc.challenge.type,
        target: udc.challenge.target,
        progress: udc.progress,
        isCompleted: udc.isCompleted,
        completedAt: udc.completedAt,
      })),
      settings: user.settings,
      friends: [
        ...user.sentFriendRequests
          .filter((f) => f.status === "accepted")
          .map((f) => ({
            id: f.friend.id,
            name: f.friend.name,
            email: f.friend.email,
            status: "friend",
          })),
        ...user.receivedFriendRequests
          .filter((f) => f.status === "accepted")
          .map((f) => ({
            id: f.user.id,
            name: f.user.name,
            email: f.user.email,
            status: "friend",
          })),
      ],
      exportDate: new Date().toISOString(),
    };

    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="volo-data-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






