import { useCallback, useState } from 'react';

/**
 * Manages which weeks are expanded in the weekly calendar.
 * Supports multi-expand so users can compare multiple weeks simultaneously.
 */
export function useWeekExpansion() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const toggleWeek = useCallback((weekStart: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekStart)) {
        next.delete(weekStart);
      } else {
        next.add(weekStart);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback((weekStarts: string[]) => {
    setExpandedWeeks(new Set(weekStarts));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedWeeks(new Set());
  }, []);

  const isExpanded = useCallback(
    (weekStart: string) => expandedWeeks.has(weekStart),
    [expandedWeeks],
  );

  return { expandedWeeks, toggleWeek, expandAll, collapseAll, isExpanded };
}
