/**
 * Hearts Recovery System
 * - Hearts regenerate 1 every 4 hours (configurable)
 * - Maximum 5 hearts
 * - Can recover hearts by watching ads
 */

export const HEART_REGENERATION_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
export const MAX_HEARTS = 5;

export interface HeartRecoveryInfo {
  currentHearts: number;
  maxHearts: number;
  heartsToRecover: number;
  nextRecoveryTime: Date | null;
  timeUntilNextHeart: number | null; // milliseconds
  canWatchAd: boolean;
}

/**
 * Calculate heart recovery information
 */
export function calculateHeartRecovery(
  currentHearts: number,
  lastHeartLossTime: Date | null,
  now: Date = new Date()
): HeartRecoveryInfo {
  // If hearts are full, no recovery needed
  if (currentHearts >= MAX_HEARTS) {
    return {
      currentHearts,
      maxHearts: MAX_HEARTS,
      heartsToRecover: 0,
      nextRecoveryTime: null,
      timeUntilNextHeart: null,
      canWatchAd: false,
    };
  }

  const heartsNeeded = MAX_HEARTS - currentHearts;
  let heartsToRecover = 0;
  let nextRecoveryTime: Date | null = null;
  let timeUntilNextHeart: number | null = null;

  if (lastHeartLossTime) {
    const timeSinceLastLoss = now.getTime() - lastHeartLossTime.getTime();
    heartsToRecover = Math.min(
      Math.floor(timeSinceLastLoss / HEART_REGENERATION_INTERVAL_MS),
      heartsNeeded
    );

    if (heartsToRecover < heartsNeeded) {
      // Calculate time until next heart
      const timeElapsed = timeSinceLastLoss % HEART_REGENERATION_INTERVAL_MS;
      timeUntilNextHeart = HEART_REGENERATION_INTERVAL_MS - timeElapsed;
      nextRecoveryTime = new Date(now.getTime() + timeUntilNextHeart);
    }
  } else {
    // No last loss time, set recovery to start now
    timeUntilNextHeart = HEART_REGENERATION_INTERVAL_MS;
    nextRecoveryTime = new Date(now.getTime() + HEART_REGENERATION_INTERVAL_MS);
  }

  return {
    currentHearts,
    maxHearts: MAX_HEARTS,
    heartsToRecover,
    nextRecoveryTime,
    timeUntilNextHeart,
    canWatchAd: currentHearts < MAX_HEARTS,
  };
}

/**
 * Format time until next heart in a human-readable format
 */
export function formatTimeUntilNextHeart(ms: number | null): string {
  if (ms === null) return "Full";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m`;
  }

  return `${seconds}s`;
}






