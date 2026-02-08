/**
 * Central helpers for safe JSON serialization/deserialization
 * Used for fields stored as String in SQLite that hold JSON data
 */

export function toDB(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch (e) {
    // Fallback: store as string representation
    try {
      return String(value);
    } catch (_) {
      return null;
    }
  }
}

export function fromDB<T = unknown>(value: string | null | undefined): T | null {
  if (value === undefined || value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    // If parsing fails, return the raw string wrapped as an object
    return (value as unknown) as T;
  }
}

/**
 * Type-safe helpers for specific JSON fields
 */

export interface AchievementCriteria extends Record<string, unknown> {
  type?: string;
  minXP?: number;
  minStreak?: number;
  lessonId?: string;
  [key: string]: unknown;
}

export function toDBCriteria(value: AchievementCriteria | null | undefined): string | null {
  return toDB(value);
}

export function fromDBCriteria(value: string | null | undefined): AchievementCriteria | null {
  return fromDB<AchievementCriteria>(value);
}

export interface AdminPermissions extends Record<string, unknown> {
  canManageUsers?: boolean;
  canManageContent?: boolean;
  canManageAchievements?: boolean;
  canViewAnalytics?: boolean;
  [key: string]: unknown;
}

export function toDBPermissions(value: AdminPermissions | null | undefined): string | null {
  return toDB(value);
}

export function fromDBPermissions(value: string | null | undefined): AdminPermissions | null {
  return fromDB<AdminPermissions>(value);
}
