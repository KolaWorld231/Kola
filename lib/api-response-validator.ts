/**
 * API Response Validator
 * Utilities for validating API responses with type guards
 */

import {
  isLanguagesResponse,
  isLanguageResponse,
  isUserResponse,
  isUserCoursesResponse,
  isAssessmentResponse,
  isAssessmentStatusResponse,
  isLessonCompletionResponse,
  isExerciseCompletionResponse,
  isLanguageUpdateResponse,
  isApiErrorResponse,
  parseApiResponse,
} from "@/lib/type-guards";
import {
  LanguagesResponse,
  LanguageResponse,
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
 * Validate and parse API response
 */
export async function validateApiResponse<T>(
  response: Response,
  typeGuard: (val: unknown) => val is T,
  errorMessage?: string
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isApiErrorResponse(errorData)) {
      throw new Error(errorData.error);
    }
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return parseApiResponse(data, typeGuard, errorMessage);
}

/**
 * Pre-configured validators for common API responses
 */
export const apiValidators = {
  languages: (response: Response) =>
    validateApiResponse<LanguagesResponse>(response, isLanguagesResponse, "Invalid languages response"),
  
  language: (response: Response) =>
    validateApiResponse<LanguageResponse>(response, isLanguageResponse, "Invalid language response"),
  
  user: (response: Response) =>
    validateApiResponse<UserResponse>(response, isUserResponse, "Invalid user response"),
  
  userCourses: (response: Response) =>
    validateApiResponse<UserCoursesResponse>(response, isUserCoursesResponse, "Invalid user courses response"),
  
  assessment: (response: Response) =>
    validateApiResponse<AssessmentResponse>(response, isAssessmentResponse, "Invalid assessment response"),
  
  assessmentStatus: (response: Response) =>
    validateApiResponse<AssessmentStatusResponse>(response, isAssessmentStatusResponse, "Invalid assessment status response"),
  
  lessonCompletion: (response: Response) =>
    validateApiResponse<LessonCompletionResponse>(response, isLessonCompletionResponse, "Invalid lesson completion response"),
  
  exerciseCompletion: (response: Response) =>
    validateApiResponse<ExerciseCompletionResponse>(response, isExerciseCompletionResponse, "Invalid exercise completion response"),
  
  languageUpdate: (response: Response) =>
    validateApiResponse<LanguageUpdateResponse>(response, isLanguageUpdateResponse, "Invalid language update response"),
};

