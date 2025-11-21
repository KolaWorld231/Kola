import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/m4a",
];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Generate a unique filename
 */
export function generateFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = originalName.split(".").pop() || "";
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = nameWithoutExt
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .substring(0, 50);

  const filename = `${prefix ? `${prefix}-` : ""}${sanitizedName}-${timestamp}-${random}.${ext}`;
  return filename;
}

/**
 * Save uploaded file to disk
 */
export async function saveFile(
  file: File,
  directory: "audio" | "images" | "avatars",
  prefix?: string
): Promise<FileUploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure directory exists
  const publicDir = join(process.cwd(), "public", "assets", directory);
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }

  // Generate filename
  const filename = generateFilename(file.name, prefix);

  // Save file
  const filepath = join(publicDir, filename);
  await writeFile(filepath, buffer);

  // Return URL (relative to public directory)
  const url = `/assets/${directory}/${filename}`;

  return {
    url,
    filename,
    size: file.size,
    mimeType: file.type,
  };
}



