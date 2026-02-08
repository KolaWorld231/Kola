/**
 * Type definitions for Prisma errors
 */

export interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
    cause?: string;
    [key: string]: unknown;
  };
}

export function isPrismaError(error: unknown): error is PrismaError {
  return (
    error instanceof Error &&
    typeof (error as PrismaError).code === "string"
  );
}

export function getPrismaErrorCode(error: unknown): string | undefined {
  if (isPrismaError(error)) {
    return error.code;
  }
  return undefined;
}

export function getPrismaErrorMeta(error: unknown): Record<string, unknown> | undefined {
  if (isPrismaError(error)) {
    return error.meta;
  }
  return undefined;
}


