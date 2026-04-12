import type { GlobalChangeEntry } from '@regranted/shared';
import { ChevronRight, History } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { StateCountBadge } from '@/components/shared/state-count-badge';
import { ZoneBadge, type ZoneKey } from '@/components/shared/zone-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date-format';

import { useGlobalChanges } from '../api/use-directory';
import type { VisaTypeFilter } from '../types/directory';

function totalPostcodesForEntry(entry: GlobalChangeEntry): number {
  return entry.changes.reduce(
    (sum, c) => sum + c.stateCounts.reduce((s, sc) => s + sc.count, 0),
    0,
  );
}

interface ChangeHistorySidebarProps {
  visaType: VisaTypeFilter;
}

export function ChangeHistorySidebar({ visaType }: ChangeHistorySidebarProps) {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useGlobalChanges({
    visaType,
    page,
  });

  const entries = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 0;

  return (
    <Card className="w-80 py-0 gap-0 shrink-0 sticky top-8 self-start max-h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <CardHeader className="px-3 h-9 shrink-0 items-center border-b py-0! gap-0">
        <CardTitle className="flex items-center gap-2 text-[13px] font-semibold">
          <History className="w-4 h-4 text-primary" />
          Change History
        </CardTitle>
      </CardHeader>

      {/* Table header */}
      <div className="grid grid-cols-[28px_55px_1fr] gap-0 px-3 h-7 items-center bg-muted/50 border-b text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Zone</span>
        <span>Action</span>
        <span>Postcodes</span>
      </div>

      {/* Body */}
      <CardContent className="p-0 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-3 py-2 space-y-1.5">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-full h-5 rounded" />
                <Skeleton className="w-full h-5 rounded" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No change history available.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.date} className="border-t first:border-t-0">
              {/* Date header row */}
              <div className="flex items-center justify-between px-3 h-7 bg-background">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {formatDate(entry.date)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {totalPostcodesForEntry(entry)}
                  </span>
                </div>
                <Link
                  to={`/app/tools/directory/changes/${entry.date}`}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Details
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Change rows */}
              {entry.changes.map((change, ci) => (
                <div
                  key={`${change.zone}-${change.action}-${ci}`}
                  className="grid grid-cols-[28px_55px_1fr] gap-0 px-3 h-7 items-center"
                >
                  {/* Zone */}
                  <ZoneBadge zone={change.zone as ZoneKey} size="sm" />

                  {/* Action */}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-medium w-fit',
                      change.action === 'Added'
                        ? 'bg-success-light text-success'
                        : 'bg-danger-light text-danger',
                    )}
                  >
                    {change.action}
                  </span>

                  {/* State badges with counts */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {change.stateCounts.map((sc) => (
                      <StateCountBadge
                        key={sc.stateCode}
                        stateCode={sc.stateCode}
                        count={sc.count}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </CardContent>

      {/* Footer with pagination */}
      {totalPages > 1 && (
        <CardFooter className="px-3 py-0 h-9 border-t bg-muted/50 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {total} changes
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="h-6 text-[10px] px-2"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="h-6 text-[10px] px-2"
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
