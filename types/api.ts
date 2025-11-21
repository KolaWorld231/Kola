/**
 * API Response Types
 * 
 * Type definitions for API request/response structures
 * Ensures type safety across the application
 */

// Language API Types
export interface LanguageResponse {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
  flagEmoji?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface LanguagesResponse {
  languages: LanguageResponse[];
}

// Lesson API Types
export interface ExerciseOption {
  id: string;
  text: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  isCorrect: boolean;
}

export interface Exercise {
  id: string;
  type: string;
  question: string;
  questionAudio?: string | null;
  questionImage?: string | null;
  correctAnswer: string;
  grammarTip?: string | null;
  order: number;
  xpReward: number;
  options?: ExerciseOption[];
}

export interface LessonResponse {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  xpReward: number;
  exercises: Exercise[];
  unit?: {
    id: string;
    title: string;
    language?: {
      code: string;
      name: string;
    };
  };
}

// User API Types
export interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  hearts: number;
  lastActivityDate?: Date | null;
  nextHeartRegeneration?: Date | null;
  selectedLanguageId?: string | null;
}

export interface UserCoursesResponse {
  languages: LanguageResponse[];
  selectedLanguageId: string | null;
}

// Assessment API Types
export interface AssessmentData {
  selectedLanguageId: string;
  selectedLevel: string;
  selectedTribe?: string | null;
  selectedGoals: string[];
  selectedDailyGoal: number;
}

export interface AssessmentResponse {
  success: boolean;
  message?: string;
  assessment?: {
    id: string;
    userId: string;
    selectedLanguageId: string;
    selectedLevel: string;
    selectedTribe?: string | null;
    selectedGoals: string[];
    selectedDailyGoal: number;
  };
}

export interface AssessmentStatusResponse {
  completed: boolean;
  assessment?: AssessmentData;
}

// Analytics API Types
export interface AnalyticsResponse {
  period: string;
  xp: {
    total: number;
    average: number;
    entries: number;
  };
  lessons: {
    completed: number;
    averageAccuracy: number;
  };
  exercises: {
    completed: number;
    totalXP: number;
  };
  languageProgress?: {
    completedLessons: number;
    totalLessons: number;
    completedUnits: number;
    totalUnits: number;
  };
  dailyXPBreakdown: Record<string, number>;
  timeSpent: {
    minutes: number;
    hours: number;
  };
}

// Lesson Completion API Types
export interface LessonCompletionRequest {
  correctAnswers: number;
  totalQuestions: number;
}

export interface LessonCompletionResponse {
  message: string;
  xpEarned: number;
  progress: {
    id: string;
    userId: string;
    lessonId: string;
    isCompleted: boolean;
    completedAt: Date;
    attempts: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
  };
  achievements: Array<{
    id: string;
    code: string;
    name: string;
    icon?: string | null;
    xpReward: number;
  }>;
}

// Exercise Completion API Types
export interface ExerciseCompletionRequest {
  isCorrect: boolean;
}

export interface ExerciseCompletionResponse {
  message: string;
  xpEarned?: number;
  heartsLost?: number;
  heartsRemaining?: number;
  achievements?: Array<{
    id: string;
    code: string;
    name: string;
    icon?: string | null;
    xpReward: number;
  }>;
}

// Admin API Types
export interface LanguageUpdateRequest {
  isActive: boolean;
}

export interface LanguageUpdateResponse {
  message: string;
  language: LanguageResponse;
}

// Error Response Types
export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

