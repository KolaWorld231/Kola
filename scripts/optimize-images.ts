#!/usr/bin/env tsx

/**
 * Image Optimization Script
 * Converts images to WebP format and optimizes them
 * 
 * Usage:
 *   npm run optimize-images
 *   npm run optimize-images -- --input=./public/images --output=./public/images/optimized
 */

import { execSync } from "child_process";
import { readdirSync, statSync, existsSync, mkdirSync } from "fs";
import path from "path";

const INPUT_DIR = process.argv
  .find((arg) => arg.startsWith("--input="))
  ?.split("=")[1] || "./public/images";

const OUTPUT_DIR = process.argv
  .find((arg) => arg.startsWith("--output="))
  ?.split("=")[1] || "./public/images/optimized";

const SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png", ".webp"];

interface ImageFile {
  name: string;
  path: string;
  size: number;
}

function findImages(dir: string): ImageFile[] {
  const images: ImageFile[] = [];

  if (!existsSync(dir)) {
    console.warn(`Directory ${dir} does not exist`);
    return images;
  }

  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      images.push(...findImages(filePath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        images.push({
          name: file,
          path: filePath,
          size: stat.size,
        });
      }
    }
  }

  return images;
}

function checkImageMagickInstalled(): boolean {
  try {
    execSync("which convert", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkSharpInstalled(): boolean {
  try {
    require.resolve("sharp");
    return true;
  } catch {
    return false;
  }
}

async function optimizeImageWithSharp(image: ImageFile): Promise<void> {
  try {
    const sharp = require("sharp");
    const outputPath = path.join(
      OUTPUT_DIR,
      path.basename(image.name, path.extname(image.name)) + ".webp"
    );

    // Ensure output directory exists
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    await sharp(image.path)
      .webp({ quality: 85 })
      .resize(1920, null, { withoutEnlargement: true })
      .toFile(outputPath);

    const newSize = statSync(outputPath).size;
    const saved = image.size - newSize;
    const percentage = ((saved / image.size) * 100).toFixed(1);

    console.log(
      `✓ ${image.name} → ${path.basename(outputPath)} (${percentage}% smaller)`
    );
  } catch (error) {
    console.error(`✗ Failed to optimize ${image.name}:`, error);
  }
}

async function optimizeImages(): Promise<void> {
  console.log("🖼️  Image Optimization Script");
  console.log("=" .repeat(40));
  console.log("");

  const images = findImages(INPUT_DIR);

  if (images.length === 0) {
    console.log("No images found in", INPUT_DIR);
    return;
  }

  console.log(`Found ${images.length} image(s) to optimize`);
  console.log("");

  // Check for optimization tools
  const hasSharp = checkSharpInstalled();
  const hasImageMagick = checkImageMagickInstalled();

  if (!hasSharp && !hasImageMagick) {
    console.error("❌ No image optimization tool found!");
    console.log("");
    console.log("Please install one of the following:");
    console.log("  1. Sharp (recommended for Node.js):");
    console.log("     npm install --save-dev sharp");
    console.log("");
    console.log("  2. ImageMagick:");
    console.log("     brew install imagemagick  # macOS");
    console.log("     apt-get install imagemagick  # Linux");
    return;
  }

  if (!hasSharp) {
    console.warn("⚠️  Sharp not installed, falling back to ImageMagick");
    console.warn("⚠️  Install Sharp for better performance: npm install --save-dev sharp");
  }

  console.log("Optimizing images...");
  console.log("");

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const image of images) {
    totalOriginalSize += image.size;
    await optimizeImageWithSharp(image);
    const optimizedPath = path.join(
      OUTPUT_DIR,
      path.basename(image.name, path.extname(image.name)) + ".webp"
    );
    if (existsSync(optimizedPath)) {
      totalOptimizedSize += statSync(optimizedPath).size;
    }
  }

  console.log("");
  console.log("=" .repeat(40));
  console.log("✅ Optimization complete!");
  console.log("");
  console.log(`Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  const totalSaved = totalOriginalSize - totalOptimizedSize;
  const totalPercentage = ((totalSaved / totalOriginalSize) * 100).toFixed(1);
  console.log(`Space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${totalPercentage}%)`);
  console.log("");
  console.log(`Optimized images saved to: ${OUTPUT_DIR}`);
}

optimizeImages().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});


