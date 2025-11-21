/**
 * Type guards for runtime type checking
 * Used for validating API request bodies and responses
 */

import {
  LanguageResponse,
  LanguagesResponse,
  UserResponse,
  UserCoursesResponse,
  AssessmentResponse,
  AssessmentStatusResponse,
  LessonCompletionResponse,
  ExerciseCompletionResponse,
  LanguageUpdateResponse,
  ApiErrorResponse,
} from "@/types/api";

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid email
 */
export function isValidEmail(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard to check if a value is a valid number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard to check if a value is a positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value) && value > 0;
}

/**
 * Type guard to check if a value is a valid boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  if (itemGuard) {
    return value.every(itemGuard);
  }
  return true;
}

/**
 * Type guard to check if a value is an object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type guard for assessment request body
 */
export interface AssessmentRequestBody {
  languageId: string;
  level: string;
  tribe?: string;
  learningGoals?: string[];
  dailyGoal?: number;
}

export function isAssessmentRequestBody(value: unknown): value is AssessmentRequestBody {
  if (!isObject(value)) return false;
  return (
    isNonEmptyString(value.languageId) &&
    isNonEmptyString(value.level) &&
    (value.tribe === undefined || isNonEmptyString(value.tribe)) &&
    (value.learningGoals === undefined || isArray(value.learningGoals, isNonEmptyString)) &&
    (value.dailyGoal === undefined || isPositiveInteger(value.dailyGoal))
  );
}

/**
 * Type guard for signup request body
 */
export interface SignupRequestBody {
  name?: string;
  email: string;
  password: string;
}

export function isSignupRequestBody(value: unknown): value is SignupRequestBody {
  if (!isObject(value)) return false;
  return (
    isValidEmail(value.email) &&
    isNonEmptyString(value.password) &&
    (value.name === undefined || isNonEmptyString(value.name))
  );
}

/**
 * Type guard for lesson complete request body
 */
export interface LessonCompleteRequestBody {
  correctAnswers: number;
  totalQuestions: number;
}

export function isLessonCompleteRequestBody(value: unknown): value is LessonCompleteRequestBody {
  if (!isObject(value)) return false;
  return (
    isPositiveInteger(value.correctAnswers) &&
    isPositiveInteger(value.totalQuestions) &&
    value.correctAnswers <= value.totalQuestions
  );
}

/**
 * Type guard for exercise complete request body
 */
export interface ExerciseCompleteRequestBody {
  isCorrect: boolean;
}

export function isExerciseCompleteRequestBody(value: unknown): value is ExerciseCompleteRequestBody {
  if (!isObject(value)) return false;
  return isBoolean(value.isCorrect);
}

/**
 * Type guard for language activation request body
 */
export interface LanguageActivationRequestBody {
  isActive: boolean;
}

export function isLanguageActivationRequestBody(value: unknown): value is LanguageActivationRequestBody {
  if (!isObject(value)) return false;
  return isBoolean(value.isActive);
}

/**
 * Type guard for hearts purchase request body
 */
export interface HeartsPurchaseRequestBody {
  heartsToPurchase: number;
}

export function isHeartsPurchaseRequestBody(value: unknown): value is HeartsPurchaseRequestBody {
  if (!isObject(value)) return false;
  return isPositiveInteger(value.heartsToPurchase);
}

// ============================================================================
// API Response Type Guards
// ============================================================================

/**
 * Type guard for LanguageResponse
 */
export function isLanguageResponse(value: unknown): value is LanguageResponse {
  if (!isObject(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.code) &&
    isNonEmptyString(value.name) &&
    isBoolean(value.isActive) &&
    (value.nativeName === null || value.nativeName === undefined || isNonEmptyString(value.nativeName)) &&
    (value.flagEmoji === null || value.flagEmoji === undefined || isNonEmptyString(value.flagEmoji)) &&
    (value.description === null || value.description === undefined || isNonEmptyString(value.description))
  );
}

/**
 * Type guard for LanguagesResponse
 */
export function isLanguagesResponse(value: unknown): value is LanguagesResponse {
  if (!isObject(value)) return false;
  if (!isArray(value.languages, isLanguageResponse)) return false;
  return true;
}

/**
 * Type guard for UserResponse
 */
export function isUserResponse(value: unknown): value is UserResponse {
  if (!isObject(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    isValidEmail(value.email) &&
    isNumber(value.totalXP) &&
    isNumber(value.currentStreak) &&
    isNumber(value.longestStreak) &&
    isNumber(value.hearts) &&
    (value.name === null || value.name === undefined || isNonEmptyString(value.name)) &&
    (value.username === null || value.username === undefined || isNonEmptyString(value.username)) &&
    (value.selectedLanguageId === null || value.selectedLanguageId === undefined || isNonEmptyString(value.selectedLanguageId))
  );
}

/**
 * Type guard for UserCoursesResponse
 */
export function isUserCoursesResponse(value: unknown): value is UserCoursesResponse {
  if (!isObject(value)) return false;
  return (
    isArray(value.languages, isLanguageResponse) &&
    (value.selectedLanguageId === null || value.selectedLanguageId === undefined || isNonEmptyString(value.selectedLanguageId))
  );
}

/**
 * Type guard for AssessmentResponse
 */
export function isAssessmentResponse(value: unknown): value is AssessmentResponse {
  if (!isObject(value)) return false;
  return (
    isBoolean(value.success) &&
    (value.message === undefined || isNonEmptyString(value.message))
  );
}

/**
 * Type guard for AssessmentStatusResponse
 */
export function isAssessmentStatusResponse(value: unknown): value is AssessmentStatusResponse {
  if (!isObject(value)) return false;
  return isBoolean(value.completed);
}

/**
 * Type guard for LessonCompletionResponse
 */
export function isLessonCompletionResponse(value: unknown): value is LessonCompletionResponse {
  if (!isObject(value)) return false;
  return (
    isNonEmptyString(value.message) &&
    isNumber(value.xpEarned) &&
    isObject(value.progress) &&
    isArray(value.achievements || [])
  );
}

/**
 * Type guard for ExerciseCompletionResponse
 */
export function isExerciseCompletionResponse(value: unknown): value is ExerciseCompletionResponse {
  if (!isObject(value)) return false;
  return (
    isNonEmptyString(value.message) &&
    (value.xpEarned === undefined || isNumber(value.xpEarned)) &&
    (value.heartsLost === undefined || isNumber(value.heartsLost)) &&
    (value.heartsRemaining === undefined || isNumber(value.heartsRemaining)) &&
    (value.achievements === undefined || isArray(value.achievements))
  );
}

/**
 * Type guard for LanguageUpdateResponse
 */
export function isLanguageUpdateResponse(value: unknown): value is LanguageUpdateResponse {
  if (!isObject(value)) return false;
  return (
    isNonEmptyString(value.message) &&
    isLanguageResponse(value.language)
  );
}

/**
 * Type guard for ApiErrorResponse
 */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isObject(value)) return false;
  return (
    isNonEmptyString(value.error) &&
    (value.details === undefined || isNonEmptyString(value.details)) &&
    (value.code === undefined || isNonEmptyString(value.code))
  );
}

/**
 * Safe API response parser with type validation
 */
export function parseApiResponse<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  errorMessage = "Invalid API response format"
): T {
  if (!typeGuard(value)) {
    throw new Error(errorMessage);
  }
  return value;
}

