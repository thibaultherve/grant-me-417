'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for the calendar grid.
 * Shows an animated placeholder while data is loading.
 */
export function CalendarSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Header row with day names */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="border-r px-2 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid skeleton (6 rows x 7 columns = 42 cells) */}
      <div className="grid grid-cols-7">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="min-h-[100px] border-b border-r p-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="mt-2 space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
