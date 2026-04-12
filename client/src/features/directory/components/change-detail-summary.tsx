import { ExternalLink } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { formatDate } from '@/utils/date-format';

interface ChangeDetailSummaryProps {
  date: string;
  totalAffected: number;
  sourceUrl: string | null;
}

export function ChangeDetailSummary({
  date,
  totalAffected,
  sourceUrl,
}: ChangeDetailSummaryProps) {
  return (
    <Card className="flex-row items-center gap-8 px-5 py-4">
      {/* Date block */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Date
        </span>
        <span className="text-sm font-semibold text-foreground">
          {formatDate(date)}
        </span>
      </div>

      <div className="h-9 w-px bg-border" />

      {/* Total block */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total Postcodes Affected
        </span>
        <span className="text-[22px] font-bold leading-tight text-foreground">
          {totalAffected}
        </span>
      </div>

      <div className="h-9 w-px bg-border" />

      {/* Source block */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Source
        </span>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            immi.homeaffairs.gov.au
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </div>
    </Card>
  );
}
