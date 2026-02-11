import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// SM-2 algorithm simplified
function calculateNextReview(ease: number, repetitions: number, quality: number) {
  // quality 0-5
  if (quality < 3) {
    repetitions = 0;
    const nextInterval = 1;
    return { ease: Math.max(1.3, ease - 0.2), repetitions, interval: nextInterval };
  }

  repetitions += 1;
  if (repetitions === 1) {
    return { ease, repetitions, interval: 1 };
  }
  if (repetitions === 2) {
    return { ease, repetitions, interval: 6 };
  }

  const interval = Math.round((repetitions - 1) * ease);
  const newEase = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { ease: newEase, repetitions, interval };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const body = await request.json();
    const { vocabularyId, quality } = body;
    const userId = body.userId || session?.user?.id;
    if (!userId || !vocabularyId || typeof quality !== "number") return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    let progress = await prisma.flashcardProgress.findFirst({ where: { userId, vocabularyId } });
    if (!progress) {
      // create initial
      const now = new Date();
      const ease = 2.5;
      const repetitions = 0;
      const { ease: newEase, repetitions: newReps, interval } = calculateNextReview(ease, repetitions, quality);
      const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
      progress = await prisma.flashcardProgress.create({ data: { userId, vocabularyId, easeFactor: newEase, interval, repetitions: newReps, nextReview, lastReviewed: now } });
      return NextResponse.json({ progress });
    }

    const now = new Date();
    const { ease, repetitions, interval } = calculateNextReview(progress.easeFactor || 2.5, progress.repetitions || 0, quality);
    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
    const updated = await prisma.flashcardProgress.update({ where: { id: progress.id }, data: { easeFactor: ease, repetitions, interval, nextReview, lastReviewed: now } });
    return NextResponse.json({ progress: updated });
  } catch (error) {
    console.error("/api/srs/review POST error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
