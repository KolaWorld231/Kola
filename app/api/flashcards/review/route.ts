import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import {
  sortFlashcardsByPriority,
  getDueFlashcards,
} from "@/lib/spaced-repetition";

/**
 * Get flashcards for review practice
 * Returns vocabulary words with spaced repetition scheduling
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let languageId = searchParams.get("languageId");
    const languageCode = searchParams.get("languageCode");
    const limit = parseInt(searchParams.get("limit") || "20");

    // If language code provided, get language ID
    if (!languageId && languageCode) {
      const language = await prisma.language.findUnique({
        where: { code: languageCode },
        select: { id: true },
      });
      if (language) {
        languageId = language.id;
      }
    }

    // If still no language ID, try user's selected language
    if (!languageId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { selectedLanguageId: true },
      });
      if (user?.selectedLanguageId) {
        languageId = user.selectedLanguageId;
      }
    }

    if (!languageId) {
      return NextResponse.json(
        { error: "languageId or languageCode is required, or select a language first" },
        { status: 400 }
      );
    }

    // Get all vocabulary for the language
    const vocabularies = await prisma.vocabulary.findMany({
      where: { languageId },
      orderBy: { createdAt: "asc" },
    });

    if (vocabularies.length === 0) {
      return NextResponse.json({ flashcards: [], count: 0 });
    }

    // Get user's flashcard progress
    const flashcardProgress = await prisma.flashcardProgress.findMany({
      where: {
        userId: session.user.id,
        vocabularyId: {
          in: vocabularies.map((v) => v.id),
        },
      },
    });

    // Build flashcard stats from vocabulary
    const now = new Date();
    const flashcards = vocabularies.map((vocab) => {
      // Find existing progress for this vocabulary
      const progress = flashcardProgress.find(
        (p) => p.vocabularyId === vocab.id
      );

      if (progress) {
        return {
          vocabularyId: vocab.id,
          easeFactor: progress.easeFactor,
          interval: progress.interval,
          repetitions: progress.repetitions,
          nextReview: progress.nextReview,
          lastReviewed: progress.lastReviewed || undefined,
        };
      }

      // New flashcard - due for review now
      return {
        vocabularyId: vocab.id,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: now,
        lastReviewed: undefined,
      };
    });

    // Get due flashcards and sort by priority
    const dueFlashcards = getDueFlashcards(flashcards, now);
    const sortedFlashcards = sortFlashcardsByPriority(dueFlashcards);

    // Get the vocabulary details for due flashcards
    const flashcardVocabularies = sortedFlashcards
      .slice(0, limit)
      .map((card) => {
        const vocab = vocabularies.find((v) => v.id === card.vocabularyId);
        if (!vocab) return null;
        return {
          id: vocab.id,
          word: vocab.word,
          translation: vocab.translation,
          phonetic: vocab.phonetic,
          audioUrl: vocab.audioUrl,
          languageId: vocab.languageId,
          stats: card,
        };
      })
      .filter((v) => v !== null);

    // Include language info in response
    const language = await prisma.language.findUnique({
      where: { id: languageId },
      select: {
        id: true,
        code: true,
        name: true,
        flagEmoji: true,
      },
    });

    const flashcardsWithLanguage = flashcardVocabularies.map((vocab) => ({
      ...vocab,
      languageId: language?.id,
      language: language || null,
    }));

    return NextResponse.json({
      flashcards: flashcardsWithLanguage,
      count: flashcardsWithLanguage.length,
      totalDue: dueFlashcards.length,
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Update flashcard progress after review
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vocabularyId, knowsIt, quality } = await request.json();

    if (!vocabularyId || (typeof knowsIt !== "boolean" && typeof quality !== "number")) {
      return NextResponse.json(
        { error: "vocabularyId and knowsIt (boolean) or quality (0-3) are required" },
        { status: 400 }
      );
    }

    // For now, we'll track flashcard progress via XP
    // In production, create a dedicated FlashcardProgress table
    const vocabulary = await prisma.vocabulary.findUnique({
      where: { id: vocabularyId },
    });

    if (!vocabulary) {
      return NextResponse.json(
        { error: "Vocabulary not found" },
        { status: 404 }
      );
    }

    // Get or create flashcard progress
    const existingProgress = await prisma.flashcardProgress.findUnique({
      where: {
        userId_vocabularyId: {
          userId: session.user.id,
          vocabularyId,
        },
      },
    });

    // Calculate next review using spaced repetition
    // Support both legacy binary mode (knowsIt) and new quality mode (0-3)
    const reviewQuality = quality !== undefined 
      ? Math.max(0, Math.min(3, quality)) // Clamp 0-3
      : (knowsIt ? 2 : 0); // Legacy: 2 = good (know it), 0 = again (don't know it)
    const now = new Date();
    const currentStats = existingProgress
      ? {
          interval: existingProgress.interval,
          easeFactor: existingProgress.easeFactor,
          repetitions: existingProgress.repetitions,
        }
      : {
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
        };

    const { calculateNextReview } = await import("@/lib/spaced-repetition");
    const nextReview = calculateNextReview(
      reviewQuality,
      currentStats.interval,
      currentStats.easeFactor,
      currentStats.repetitions
    );

    // Calculate next review date
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReview.interval);

    // Upsert flashcard progress
    await prisma.flashcardProgress.upsert({
      where: {
        userId_vocabularyId: {
          userId: session.user.id,
          vocabularyId,
        },
      },
      update: {
        easeFactor: nextReview.easeFactor,
        interval: nextReview.interval,
        repetitions: nextReview.repetitions,
        nextReview: nextReviewDate,
        lastReviewed: now,
      },
      create: {
        userId: session.user.id,
        vocabularyId,
        easeFactor: nextReview.easeFactor,
        interval: nextReview.interval,
        repetitions: nextReview.repetitions,
        nextReview: nextReviewDate,
        lastReviewed: now,
      },
    });

    // Award XP based on quality (0=again: 0 XP, 1=hard: 1 XP, 2=good: 2 XP, 3=easy: 3 XP)
    const xpEarned = reviewQuality > 0 ? reviewQuality : 0;
    if (xpEarned > 0) {
      await prisma.userXP.create({
        data: {
          userId: session.user.id,
          amount: xpEarned,
          source: "flashcard",
          sourceId: vocabularyId,
          description: `Reviewed flashcard: ${vocabulary.word} (${reviewQuality === 1 ? "hard" : reviewQuality === 2 ? "good" : "easy"})`,
        },
      });

      // Update user's total XP
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: { increment: xpEarned },
        },
      });
    }

    return NextResponse.json({
      message: "Flashcard reviewed",
      xpEarned,
      nextReview: nextReviewDate,
      interval: nextReview.interval,
      easeFactor: nextReview.easeFactor,
      repetitions: nextReview.repetitions,
    });
  } catch (error) {
    console.error("Error updating flashcard progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

