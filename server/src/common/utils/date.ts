/**
 * Pure date utility functions for week boundary calculations.
 * Extracted from VisaProgressService for cross-module reuse.
 */

/**
 * Generate Monday→Sunday week ranges covering a date span.
 * Includes partial weeks at boundaries (aligns to Monday before startDate).
 */
export function getWeekRanges(
  startDate: Date,
  endDate: Date,
): { start: Date; end: Date }[] {
  const weeks: { start: Date; end: Date }[] = [];

  // Find the Monday on or before startDate
  const current = new Date(startDate);
  const dayOfWeek = current.getUTCDay(); // 0=Sun, 1=Mon, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  current.setUTCDate(current.getUTCDate() - daysToMonday);

  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    weeks.push({ start: weekStart, end: weekEnd });

    current.setUTCDate(current.getUTCDate() + 7);
  }

  return weeks;
}

/**
 * Get the Monday→Sunday range for a specific date.
 */
export function getWeekForDate(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const dayOfWeek = d.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const start = new Date(d);
  start.setUTCDate(start.getUTCDate() - daysToMonday);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(0, 0, 0, 0);

  return { start, end };
}
