// Gamification types for Volo animated UI

export type MascotMood = 'happy' | 'celebrating' | 'encouraging' | 'sleeping' | 'thinking';

export type SoundEffect = 'pop' | 'correct' | 'wrong' | 'levelup' | 'xp' | 'streak';

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export type FeedbackType = 'correct' | 'wrong' | 'perfect' | 'streak';

export interface MascotState {
  mood: MascotMood;
  message?: string;
}

export interface XPState {
  current: number;
  gained: number;
  level: number;
  toNextLevel: number;
}

export interface HeartsState {
  current: number;
  max: number;
}

export interface StreakState {
  days: number;
  isActive: boolean;
}

export interface LessonProgress {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  isComplete: boolean;
  isLocked: boolean;
  icon?: string;
}

export interface AnswerFeedbackState {
  isCorrect: boolean;
  message: string;
  showConfetti?: boolean;
}
