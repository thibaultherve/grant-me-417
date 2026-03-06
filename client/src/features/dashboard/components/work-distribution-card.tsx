import { Layers, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VisaOverview } from '@get-granted/shared';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface WorkDistributionCardProps {
  workDistribution: VisaOverview['workDistribution'];
  className?: string;
}

export function WorkDistributionCard({
  workDistribution,
  className,
}: WorkDistributionCardProps) {
  const totalHours = workDistribution.reduce((sum, d) => sum + d.totalHours, 0);
  const isScrollable = workDistribution.length > 4;

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg shadow-xs p-5 flex flex-col gap-4',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-info-light flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 text-info" />
        </div>
        <span className="text-sm font-semibold text-foreground leading-none">
          Work Distribution
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="focus:outline-none" tabIndex={-1}>
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            Distribution of your work hours across different industries during this visa period.
          </TooltipContent>
        </Tooltip>
      </div>

      {totalHours === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No work data available.
        </p>
      ) : (
        <>
          {/* Big number */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-foreground leading-none">
              {Number.isInteger(totalHours)
                ? totalHours
                : totalHours.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">hrs total</span>
          </div>

          {/* Stacked horizontal bar */}
          <div className="h-2.5 w-full rounded-full overflow-hidden flex">
            {workDistribution.map((d, i) => (
              <div
                key={d.industry}
                style={{
                  width: `${(d.totalHours / totalHours) * 100}%`,
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            ))}
          </div>

          {/* Industry list */}
          <div
            className={cn(
              'flex flex-col gap-3',
              isScrollable && 'overflow-y-auto max-h-50 pr-1',
            )}
          >
            {workDistribution.map((d, i) => {
              const pct = Math.round((d.totalHours / totalHours) * 100);
              const color = CHART_COLORS[i % CHART_COLORS.length];
              const hours = Number.isInteger(d.totalHours)
                ? d.totalHours
                : d.totalHours.toFixed(1);

              return (
                <div key={d.industry} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-foreground truncate">
                        {d.industry}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-semibold text-foreground">
                        {hours}h
                      </span>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {pct}%
                      </span>
                    </div>
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
