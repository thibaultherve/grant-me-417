import { Building, HelpCircle, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VisaOverview } from '@get-granted/shared';
import { cn } from '@/lib/utils';

const ELIGIBLE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface EmployerBreakdownCardProps {
  employerBreakdown: VisaOverview['employerBreakdown'];
  className?: string;
}

export function EmployerBreakdownCard({
  employerBreakdown,
  className,
}: EmployerBreakdownCardProps) {
  const eligibleEmployers = employerBreakdown.filter((e) => e.isEligible);
  const nonEligibleEmployers = employerBreakdown.filter((e) => !e.isEligible);

  const eligibleHours = eligibleEmployers.reduce(
    (sum, e) => sum + e.totalHours,
    0,
  );
  const nonEligibleHours = nonEligibleEmployers.reduce(
    (sum, e) => sum + e.totalHours,
    0,
  );
  const totalHours = eligibleHours + nonEligibleHours;

  const isScrollable = employerBreakdown.length > 4;

  // Assign colors to eligible employers only
  let eligibleColorIndex = 0;
  const colorMap = new Map<string, string>();
  for (const e of employerBreakdown) {
    if (e.isEligible) {
      colorMap.set(
        e.employerId,
        ELIGIBLE_COLORS[eligibleColorIndex % ELIGIBLE_COLORS.length],
      );
      eligibleColorIndex++;
    }
  }

  const formatHours = (h: number) =>
    Number.isInteger(h) ? `${h}` : h.toFixed(1);

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg shadow-xs p-5 flex flex-col gap-4',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center shrink-0">
          <Building className="w-4 h-4 text-success" />
        </div>
        <span className="text-sm font-semibold text-foreground leading-none">
          Employer Breakdown
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="focus:outline-none" tabIndex={-1}>
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            Hours breakdown by employer. Only hours from eligible employers (correct industry + regional location) count toward your visa days.
          </TooltipContent>
        </Tooltip>
      </div>

      {totalHours === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No employer data available.
        </p>
      ) : (
        <>
          {/* Big number row */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-foreground leading-none">
                {formatHours(eligibleHours)}
              </span>
              <span className="text-sm text-muted-foreground">
                hrs eligible
              </span>
            </div>
            {nonEligibleHours > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {formatHours(nonEligibleHours)}h non-eligible
              </span>
            )}
          </div>

          {/* Stacked eligible/non-eligible bar */}
          <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-muted">
            {eligibleHours > 0 && (
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${(eligibleHours / totalHours) * 100}%` }}
              />
            )}
          </div>

          {/* Employer list */}
          <div
            className={cn(
              'flex flex-col gap-3',
              isScrollable && 'overflow-y-auto max-h-50 pr-1',
            )}
          >
            {employerBreakdown.map((e) => {
              const pct =
                totalHours > 0
                  ? Math.round((e.totalHours / totalHours) * 100)
                  : 0;
              const color = e.isEligible
                ? colorMap.get(e.employerId)!
                : 'hsl(var(--muted-foreground))';

              return (
                <div key={e.employerId} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-foreground truncate">
                        {e.employerName}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0',
                          e.isEligible
                            ? 'bg-success-light text-success'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {e.isEligible ? 'Eligible' : 'Non-eligible'}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-sm shrink-0',
                        e.isEligible
                          ? 'font-semibold text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {formatHours(e.totalHours)}h
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {isScrollable && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <span>↓</span> Scroll for more
            </p>
          )}
        </>
      )}
    </div>
  );
}
