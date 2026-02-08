import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";

/**
 * GET /api/user/profile - Get user profile
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
        password: true, // Include to check if password exists
        totalXP: true,
        currentStreak: true,
        longestStreak: true,
        hearts: true,
        selectedLanguage: {
          select: {
            name: true,
            flagEmoji: true,
          },
        },
        settings: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.settings?.username || null,
        password: !!user.password, // Return boolean indicating if password exists
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        hearts: user.hearts,
        selectedLanguage: user.selectedLanguage,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile - Update user profile
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, currentPassword, newPassword } = body;

    // Update password first if provided
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: "No password set for this account" },
          { status: 400 }
        );
      }

      const isPasswordValid = await compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      const hashedPassword = await hash(newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      });
    }

    // Update name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update username in settings if provided
    if (username !== undefined) {
      // Validate username format
      const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$/;
      if (username && username.trim().length > 0) {
        if (username.length < 3 || username.length > 20) {
          return NextResponse.json(
            { error: "Username must be between 3 and 20 characters" },
            { status: 400 }
          );
        }

        if (!USERNAME_REGEX.test(username)) {
          return NextResponse.json(
            { error: "Username can only contain letters, numbers, underscores, and hyphens. Must start with a letter or number." },
            { status: 400 }
          );
        }

        if (/^\d+$/.test(username)) {
          return NextResponse.json(
            { error: "Username cannot be all numbers" },
            { status: 400 }
          );
        }

        // Check if username is already taken by another user
        const existingSettings = await prisma.userSettings.findFirst({
          where: {
            username: {
              equals: username,
            },
            userId: {
              not: session.user.id,
            },
          },
        });

        if (existingSettings) {
          return NextResponse.json(
            { error: "This username is already taken" },
            { status: 400 }
          );
        }
      }

      await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          username: username || null,
        },
        update: {
          username: username || null,
        },
      });
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        settings: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...updatedUser,
        username: updatedUser.settings?.username || null,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

