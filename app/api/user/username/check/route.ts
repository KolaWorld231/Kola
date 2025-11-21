import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * Username validation rules:
 * - 3-20 characters
 * - Alphanumeric, underscores, and hyphens only
 * - Must start with a letter or number
 * - Cannot be all numbers
 */
const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: "Username is required" };
  }

  if (username.length < MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${MIN_LENGTH} characters` };
  }

  if (username.length > MAX_LENGTH) {
    return { valid: false, error: `Username must be no more than ${MAX_LENGTH} characters` };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, underscores, and hyphens. Must start with a letter or number.",
    };
  }

  // Check if username is all numbers
  if (/^\d+$/.test(username)) {
    return { valid: false, error: "Username cannot be all numbers" };
  }

  // Check for reserved usernames
  const reservedUsernames = [
    "admin",
    "administrator",
    "moderator",
    "support",
    "help",
    "api",
    "www",
    "mail",
    "email",
    "root",
    "system",
    "null",
    "undefined",
    "volo",
  ];
  if (reservedUsernames.includes(username.toLowerCase())) {
    return { valid: false, error: "This username is reserved" };
  }

  return { valid: true };
}

/**
 * GET /api/user/username/check?username=xxx - Check username availability
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Validate format
    const formatValidation = validateUsernameFormat(username);
    if (!formatValidation.valid) {
      return NextResponse.json({
        available: false,
        valid: false,
        error: formatValidation.error,
      });
    }

    // Check if username is already taken (excluding current user)
    const existingSettings = await prisma.userSettings.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // Case-insensitive check
        },
      },
      select: {
        userId: true,
      },
    });

    // If username exists and belongs to another user, it's not available
    if (existingSettings && (!session?.user?.id || existingSettings.userId !== session.user.id)) {
      return NextResponse.json({
        available: false,
        valid: true,
        error: "This username is already taken",
      });
    }

    // Username is available
    return NextResponse.json({
      available: true,
      valid: true,
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




