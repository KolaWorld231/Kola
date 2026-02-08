/**
 * Spaced Repetition Algorithm
 * Based on SM-2 algorithm (SuperMemo 2)
 */

export interface FlashcardStats {
  vocabularyId: string;
  easeFactor: number; // Starting at 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  nextReview: Date; // When to review next
  lastReviewed?: Date;
}

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * Calculate next review interval based on user response
 * @param quality - 0: wrong, 1: hard, 2: medium, 3: easy
 * @param currentInterval - Current interval in days
 * @param easeFactor - Current ease factor
 * @param repetitions - Current repetition count
 */
export function calculateNextReview(
  quality: number,
  currentInterval: number = 0,
  easeFactor: number = INITIAL_EASE_FACTOR,
  repetitions: number = 0
): {
  interval: number;
  easeFactor: number;
  repetitions: number;
} {
  let newEaseFactor = easeFactor;
  let newInterval = currentInterval;
  let newRepetitions = repetitions;

  // Update ease factor based on quality
  newEaseFactor =
    easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
  
  // Minimum ease factor
  if (newEaseFactor < MIN_EASE_FACTOR) {
    newEaseFactor = MIN_EASE_FACTOR;
  }

  // Update interval and repetitions based on quality
  if (quality === 0) {
    // Again - reset completely
    newInterval = 1;
    newRepetitions = 0;
  } else if (quality === 1) {
    // Hard - slight progress, but shorter interval
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 3; // Shorter than good
    } else {
      newInterval = Math.max(1, Math.round(currentInterval * newEaseFactor * 0.8)); // 20% shorter
    }
    newRepetitions = Math.max(0, repetitions - 0.5); // Slight penalty
  } else {
    // Good (2) or Easy (3) - correct answer
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = quality === 3 ? 4 : 6; // Easy gets shorter initial interval
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
      if (quality === 3) {
        newInterval = Math.round(newInterval * 1.2); // Easy gets 20% bonus interval
      }
    }
    newRepetitions = repetitions + 1;
  }

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
  };
}

/**
 * Convert user answer to quality rating
 * Quality ratings:
 * 0 = Again (don't know it)
 * 1 = Hard
 * 2 = Good (default for knowing it)
 * 3 = Easy
 * @param knowsIt - Whether user knows the flashcard (legacy binary mode)
 * @param quality - Optional 0-3 quality rating (0=again, 1=hard, 2=good, 3=easy)
 */
export function answerToQuality(knowsIt?: boolean, quality?: number): number {
  if (quality !== undefined && quality >= 0 && quality <= 3) {
    return quality;
  }
  // Legacy binary mode: convert knowsIt to quality
  return knowsIt ? 2 : 0; // 2 = good (default), 0 = again
}

/**
 * Get quality label
 */
export function getQualityLabel(quality: number): string {
  switch (quality) {
    case 0:
      return "Again";
    case 1:
      return "Hard";
    case 2:
      return "Good";
    case 3:
      return "Easy";
    default:
      return "Unknown";
  }
}

/**
 * Get flashcards due for review
 */
export function getDueFlashcards(
  allFlashcards: FlashcardStats[],
  today: Date = new Date()
): FlashcardStats[] {
  return allFlashcards.filter((card) => {
    const nextReviewDate = new Date(card.nextReview);
    return nextReviewDate <= today;
  });
}

/**
 * Sort flashcards by priority (due date + difficulty)
 */
export function sortFlashcardsByPriority(
  flashcards: FlashcardStats[]
): FlashcardStats[] {
  return [...flashcards].sort((a, b) => {
    // First, by due date (earliest first)
    const dateDiff =
      new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
    if (dateDiff !== 0) return dateDiff;

    // Then by lower ease factor (harder cards first)
    return a.easeFactor - b.easeFactor;
  });
}






