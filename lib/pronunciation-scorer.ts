/**
 * Pronunciation Scoring System
 * Provides scoring algorithms for pronunciation accuracy
 */

/**
 * Calculate pronunciation similarity between two strings
 * Uses Levenshtein distance with normalization
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 100;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  if (maxLength === 0) return 100;

  // Calculate similarity percentage
  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.max(0, Math.min(100, similarity));
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c");
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate pronunciation score based on similarity
 */
export function calculatePronunciationScore(
  userTranscript: string,
  correctAnswer: string,
  threshold: number = 70
): {
  score: number;
  isCorrect: boolean;
  feedback: string;
  accuracy: "excellent" | "good" | "fair" | "poor";
} {
  const similarity = calculateSimilarity(userTranscript, correctAnswer);
  const isCorrect = similarity >= threshold;

  let accuracy: "excellent" | "good" | "fair" | "poor";
  let feedback: string;

  if (similarity >= 90) {
    accuracy = "excellent";
    feedback = "Excellent pronunciation! 🎉";
  } else if (similarity >= 75) {
    accuracy = "good";
    feedback = "Good pronunciation! Keep practicing. 👏";
  } else if (similarity >= threshold) {
    accuracy = "fair";
    feedback = "Close! Try to pronounce more clearly. 💪";
  } else {
    accuracy = "poor";
    feedback = "Keep practicing! Listen to the audio again. 📚";
  }

  return {
    score: Math.round(similarity),
    isCorrect,
    feedback,
    accuracy,
  };
}

/**
 * Check if pronunciation is acceptable (flexible matching)
 */
export function isPronunciationAcceptable(
  userTranscript: string,
  correctAnswer: string,
  strictness: "strict" | "moderate" | "lenient" = "moderate"
): boolean {
  const thresholds = {
    strict: 90,
    moderate: 70,
    lenient: 50,
  };

  const similarity = calculateSimilarity(userTranscript, correctAnswer);
  return similarity >= thresholds[strictness];
}

/**
 * Extract key phonemes for better matching
 */
export function extractPhonemes(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Compare phoneme sequences
 */
export function comparePhonemes(
  userPhonemes: string[],
  correctPhonemes: string[]
): number {
  if (userPhonemes.length === 0 || correctPhonemes.length === 0) {
    return 0;
  }

  let matches = 0;
  const maxLength = Math.max(userPhonemes.length, correctPhonemes.length);

  for (let i = 0; i < Math.min(userPhonemes.length, correctPhonemes.length); i++) {
    if (userPhonemes[i] === correctPhonemes[i]) {
      matches++;
    }
  }

  return (matches / maxLength) * 100;
}


