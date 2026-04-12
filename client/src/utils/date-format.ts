/**
 * Format a date string to Australian locale (e.g., "15 Mar 2025").
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string to short Australian locale without year (e.g., "Mar 15").
 */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a nullable date string, returning a fallback for null/undefined.
 */
export function formatDateSafe(
  dateStr: string | null | undefined,
  fallback = 'Unknown',
): string {
  if (!dateStr) return fallback;
  return formatDate(dateStr);
}
