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
