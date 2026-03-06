/**
 * Convert a Date to "YYYY-MM-DD" string.
 * Throws if the value is null/undefined — use formatDateNullable for optional fields.
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Convert a nullable Date to "YYYY-MM-DD" string, returning fallback if null.
 */
export function formatDateNullable(
  date: Date | null | undefined,
  fallback = '',
): string {
  return date ? date.toISOString().split('T')[0] : fallback;
}

/**
 * Convert a Date to full ISO-8601 timestamp string.
 * Returns current timestamp as fallback if null.
 */
export function formatTimestamp(date: Date | null | undefined): string {
  return date?.toISOString() ?? new Date().toISOString();
}

/**
 * Convert a Prisma Decimal (or number/null) to a plain number.
 */
export function toNumber(
  value: { toString(): string } | number | null | undefined,
  fallback = 0,
): number {
  if (value == null) return fallback;
  return Number(value);
}
