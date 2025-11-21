import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import {
  saveFile,
  validateFile,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE,
} from "@/lib/file-upload";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "audio" | "image" | null;
    const prefix = formData.get("prefix") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!type || (type !== "audio" && type !== "image")) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'audio' or 'image'" },
        { status: 400 }
      );
    }

    // Validate file
    const allowedTypes =
      type === "audio" ? ALLOWED_AUDIO_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = type === "audio" ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;

    const validation = validateFile(file, allowedTypes, maxSize);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Save file (convert "image" to "images" for saveFile function)
    const directory = type === "image" ? "images" : type;
    const result = await saveFile(
      file,
      directory,
      prefix || undefined
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      size: result.size,
      mimeType: result.mimeType,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

