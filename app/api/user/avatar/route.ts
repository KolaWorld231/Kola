import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import {
  saveFile,
  validateFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/file-upload";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * POST /api/user/avatar - Upload user avatar
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get current user to delete old avatar if exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete old avatar if it exists and is a local file
    if (user?.image && user.image.startsWith("/assets/avatars/")) {
      try {
        const oldFilePath = join(process.cwd(), "public", user.image);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      } catch (error) {
        console.error("Error deleting old avatar:", error);
        // Continue even if deletion fails
      }
    }

    // Save new avatar file to avatars directory
    const result = await saveFile(
      file,
      "avatars",
      `avatar-${session.user.id}`
    );

    // Update user's image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.url },
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar - Remove user avatar
 */
export async function DELETE(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete avatar file if it exists and is a local file
    if (user?.image && user.image.startsWith("/assets/")) {
      try {
        const filePath = join(process.cwd(), "public", user.image);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error("Error deleting avatar file:", error);
        // Continue even if deletion fails
      }
    }

    // Remove image from user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("Error removing avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

