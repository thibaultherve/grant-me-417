import { ZONE_FLAG_MAP } from '@regranted/shared';
import { History } from 'lucide-react';

import { ZoneBadge, type ZoneKey } from '@/components/shared/zone-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import type { VisaTypeFilter } from '../types/directory';

/** Map a category flag name (e.g. "is_regional_australia") to ZoneKey */
function categoryToZone(category: string): ZoneKey | null {
  for (const [zone, flag] of Object.entries(ZONE_FLAG_MAP)) {
    if (flag === null) continue;
    // Handle both snake_case (DB) and camelCase variants
    const snakeFlag = flag.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (category === flag || category === snakeFlag) {
      return zone as ZoneKey;
    }
  }
  return null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
  });
}

interface ZonesHistoryCardProps {
  history: {
    effectiveDate: string;
    category: string;
    action: 'ENTERED' | 'LEFT';
    visaType: string;
  }[];
  visaType: VisaTypeFilter;
}

export function ZonesHistoryCard({ history, visaType }: ZonesHistoryCardProps) {
  const filteredHistory = history.filter((h) => h.visaType === visaType);

  return (
    <Card className="py-0 gap-0 flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="w-4 h-4 text-primary" />
          Zones History
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Zone
              </TableHead>
              <TableHead className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No zone history available.
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((entry, i) => {
                const zone = categoryToZone(entry.category);
                return (
                  <TableRow
                    key={`${entry.effectiveDate}-${entry.category}-${i}`}
                    className="h-7"
                  >
                    <TableCell className="px-3 text-[13px] text-muted-foreground">
                      {formatDate(entry.effectiveDate)}
                    </TableCell>
                    <TableCell className="px-3">
                      {zone ? (
                        <ZoneBadge zone={zone} size="sm" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {entry.category}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                          entry.action === 'ENTERED'
                            ? 'bg-success-light text-success'
                            : 'bg-danger-light text-danger',
                        )}
                      >
                        {entry.action === 'ENTERED' ? 'Added' : 'Deleted'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
