import type { GlobalChangeEntry } from '@regranted/shared';
import { Activity, ExternalLink } from 'lucide-react';
import { useState } from 'react';

import { PostcodeLinkBadge } from '@/components/shared/postcode-link-badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { useGlobalChanges } from '../api/use-directory';
import type { VisaTypeFilter } from '../types/directory';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
  });
}

interface ChangeHistoryTableProps {
  visaType: VisaTypeFilter;
}

export function ChangeHistoryTable({ visaType }: ChangeHistoryTableProps) {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useGlobalChanges({
    visaType,
    page,
  });

  const changes = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 0;

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-primary" />
          Change History
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Zone
              </TableHead>
              <TableHead className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </TableHead>
              <TableHead className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Postcodes
              </TableHead>
              <TableHead className="w-8 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Source
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-2">
                      <Skeleton className="w-12 h-4 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-6 h-5 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-14 h-5 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-32 h-4 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-4 h-4 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              : changes.map((entry: GlobalChangeEntry, i: number) => (
                  <TableRow
                    key={`${entry.effectiveDate}-${entry.zone}-${entry.action}-${i}`}
                    className="h-7"
                  >
                    <TableCell className="px-2 text-[13px] text-muted-foreground">
                      {formatDate(entry.effectiveDate)}
                    </TableCell>
                    <TableCell className="px-2">
                      <ZoneBadge zone={entry.zone as ZoneKey} size="sm" />
                    </TableCell>
                    <TableCell className="px-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                          entry.action === 'Added'
                            ? 'bg-success-light text-success'
                            : 'bg-danger-light text-danger',
                        )}
                      >
                        {entry.action}
                      </span>
                    </TableCell>
                    <TableCell className="px-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {entry.postcodes.map((pc) => (
                          <PostcodeLinkBadge
                            key={pc.postcode}
                            postcode={pc.postcode}
                            stateCode={pc.stateCode}
                            size="sm"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-2">
                      {entry.sourceUrl && (
                        <a
                          href={entry.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

            {!isLoading && changes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No change history available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {changes.length} of {total} changes
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="h-7 text-xs px-2"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="h-7 text-xs px-2"
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
