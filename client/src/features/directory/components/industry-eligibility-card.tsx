import type { PostcodeBadgeData } from '@regranted/shared';
import { ShieldCheck } from 'lucide-react';

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
import { computeEligibilityMatrix } from '../utils/eligibility-helpers';

interface IndustryEligibilityCardProps {
  eligibilityFlags: PostcodeBadgeData | null;
  visaType: VisaTypeFilter;
}

export function IndustryEligibilityCard({
  eligibilityFlags,
  visaType,
}: IndustryEligibilityCardProps) {
  const rows = eligibilityFlags
    ? computeEligibilityMatrix(eligibilityFlags, visaType)
    : [];

  const eligibleRows = rows.filter((r) => r.isEligible);
  const nonEligibleRows = rows.filter((r) => !r.isEligible);

  return (
    <Card className="py-0 gap-0 flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Industry / Zone Eligibility
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Industry
              </TableHead>
              <TableHead className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-20 text-center">
                Eligibility
              </TableHead>
              <TableHead className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Zones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Eligible industries */}
            {eligibleRows.map((row) => (
              <TableRow key={row.industry} className="h-7">
                <TableCell className="px-3 text-[13px]">{row.label}</TableCell>
                <TableCell className="px-3 text-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-success" />
                </TableCell>
                <TableCell className="px-3">
                  <div className="flex items-center gap-1">
                    {row.eligibleZones.map((zone) => (
                      <ZoneBadge key={zone} zone={zone as ZoneKey} size="sm" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Divider */}
            {nonEligibleRows.length > 0 && eligibleRows.length > 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={3}
                  className="px-3 py-2 text-[11px] text-muted-foreground"
                >
                  Not eligible in this postcode
                </TableCell>
              </TableRow>
            )}

            {/* Non-eligible industries */}
            {nonEligibleRows.map((row) => (
              <TableRow key={row.industry} className={cn('h-7', 'opacity-40')}>
                <TableCell className="px-3 text-[13px]">{row.label}</TableCell>
                <TableCell className="px-3 text-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                </TableCell>
                <TableCell className="px-3" />
              </TableRow>
            ))}

            {/* Empty state */}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No eligibility data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Legend */}
        {rows.length > 0 && (
          <div className="flex items-center gap-4 px-3 py-2 border-t text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-success" />
              Eligible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" />
              Not eligible
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
