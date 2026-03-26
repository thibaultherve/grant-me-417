import { Skeleton } from '@/components/ui/skeleton';

/** Loading skeleton matching the weekly table structure */
export function WeeklySkeleton() {
  return (
    <div className="space-y-0 rounded-lg border bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 border-b">
        <Skeleton className="h-3 w-[60px]" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8 mx-auto" />
        ))}
        <Skeleton className="h-3 w-10 ml-4" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-8" />
      </div>

      {/* Week rows */}
      {Array.from({ length: 4 }).map((_, weekIdx) => (
        <div key={weekIdx} className="border-b last:border-b-0">
          <div className="flex items-center gap-2 px-4 py-3">
            <Skeleton className="h-4 w-[70px]" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-6 mx-auto" />
            ))}
            <Skeleton className="h-4 w-8 ml-4" />
            <Skeleton className="h-5 w-10 rounded" />
            <Skeleton className="h-5 w-8 rounded" />
            <Skeleton className="h-4 w-12" />
          </div>
          {/* Visa strip skeleton */}
          <div className="flex gap-0.5 px-4 pb-2">
            <div className="w-[70px]" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-[3px] flex-1 rounded-sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mobile loading skeleton */
export function WeeklySkeletonMobile() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, weekIdx) => (
        <div key={weekIdx} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-14 rounded" />
            <Skeleton className="h-5 w-10 rounded" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-4 w-5" />
                <Skeleton className="h-[3px] w-full rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
