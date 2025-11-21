/**
 * TypeScript interfaces for Volo Language Learning Platform
 * These types mirror the Prisma schema and provide type safety across the app
 */

// ============================================================================
// Core Domain Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string | null;
  password?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Profile fields
  selectedLanguageId?: string | null;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  hearts: number;
  lastActivityDate?: Date | null;
}

export interface Language {
  id: string;
  code: string; // e.g., "kpelle", "bassa"
  name: string; // e.g., "Kpelle", "Bassa"
  nativeName: string;
  flagEmoji?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  languageId: string;
  title: string;
  description?: string | null;
  order: number;
  isLocked: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
  // Relations
  language?: Language;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description?: string | null;
  order: number;
  type: "practice" | "story" | "grammar";
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  unit?: Unit;
  exercises?: Exercise[];
  progress?: UserProgress[];
}

export type ExerciseType =
  | "multiple_choice"
  | "match"
  | "translation"
  | "drag_drop"
  | "select_missing"
  | "listen_choose"
  | "speak"
  | "flashcard";

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  question: string;
  questionAudio?: string | null;
  questionImage?: string | null;
  correctAnswer: string;
  order: number;
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
  // Relations
  lesson?: Lesson;
  options?: ExerciseOption[];
}

export interface ExerciseOption {
  id: string;
  exerciseId: string;
  text: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  isCorrect: boolean;
  order: number;
  createdAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: Date | null;
  attempts: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy?: number | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  user?: User;
  lesson?: Lesson;
}

export interface UserXP {
  id: string;
  userId: string;
  amount: number;
  source: "lesson" | "exercise" | "streak" | "achievement";
  sourceId?: string | null;
  description?: string | null;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string | null;
  xpReward: number;
  category: "streak" | "lesson" | "exercise" | "special";
  criteria?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  // Relations
  user?: User;
  achievement?: Achievement;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  period: "daily" | "weekly" | "monthly" | "all_time";
  periodStart: Date;
  periodEnd: Date;
  xp: number;
  rank: number;
  languageId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  user?: User;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CompleteLessonRequest {
  lessonId: string;
  correctAnswers: number;
  totalQuestions: number;
}

export interface CompleteLessonResponse {
  success: boolean;
  xpEarned: number;
  streakUpdated: boolean;
  achievementsUnlocked?: Achievement[];
}

export interface ExerciseAnswer {
  exerciseId: string;
  answer: string | string[]; // string for single answer, array for multiple/matching
  isCorrect: boolean;
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface LanguageTile {
  language: Language;
  progress?: {
    completedLessons: number;
    totalLessons: number;
    currentUnit?: number;
  };
  isSelected?: boolean;
}

export interface LessonTreeItem {
  lesson: Lesson;
  isLocked: boolean;
  isCompleted: boolean;
  progress?: UserProgress;
}

export interface UnitTreeItem {
  unit: Unit;
  lessons: LessonTreeItem[];
  isLocked: boolean;
  completedLessons: number;
  totalLessons: number;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface LearningState {
  currentLanguage?: Language | null;
  currentLesson?: Lesson | null;
  currentExerciseIndex: number;
  answers: ExerciseAnswer[];
  score: {
    correct: number;
    total: number;
  };
  isCompleted: boolean;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type WithRelations<T, R extends Record<string, unknown>> = T & R;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;






