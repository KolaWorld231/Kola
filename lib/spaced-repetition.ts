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

  // Update interval and repetitions
  if (quality < 2) {
    // Incorrect answer - reset
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Correct answer
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
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
 * @param knowsIt - Whether user knows the flashcard
 */
export function answerToQuality(knowsIt: boolean): number {
  return knowsIt ? 3 : 0; // 3 = easy/know it, 0 = don't know it
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






