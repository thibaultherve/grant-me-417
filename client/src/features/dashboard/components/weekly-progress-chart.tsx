import { BarChart2, HelpCircle } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VisaOverview } from '@get-granted/shared';
import { buildWeeklyProgressChartData } from '../utils/dashboard-calculations';
import { cn } from '@/lib/utils';

interface WeeklyProgressChartProps {
  overview: VisaOverview;
  className?: string;
}

export function WeeklyProgressChart({
  overview,
  className,
}: WeeklyProgressChartProps) {
  const { weeklyProgress, pace, visa } = overview;
  const { weeksRemaining, currentPace, totalWeeks, weeksElapsed } = pace;
  const { daysRequired } = visa;

  const raw = buildWeeklyProgressChartData(
    weeklyProgress,
    currentPace,
    weeksRemaining,
    daysRequired,
  );

  // Deduplicate x-axis labels: only show first occurrence of each month
  const seenMonths = new Set<string>();
  const chartData = raw.map((p, i) => {
    const showLabel = !seenMonths.has(p.label);
    if (showLabel) seenMonths.add(p.label);

    const isLastActual =
      !p.isPrediction && (i === raw.length - 1 || raw[i + 1]?.isPrediction);

    return {
      xLabel: showLabel ? p.label : '',
      eligibleDays: !p.isPrediction ? p.eligibleDays : undefined,
      cumulative: !p.isPrediction ? p.cumulativeEligibleDays : undefined,
      // Bridge: last actual point also appears in prediction series for smooth connection
      predictionLine:
        p.isPrediction || isLastActual ? p.cumulativeEligibleDays : undefined,
    };
  });

  const yRightMax = Math.max(daysRequired + 10, 100);

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg shadow-xs p-5 flex flex-col gap-4',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-info-light flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4 text-info" />
          </div>
          <span className="text-sm font-semibold text-foreground leading-none">
            Weekly Progress
          </span>
          <UITooltip>
            <TooltipTrigger asChild>
              <button className="focus:outline-none" tabIndex={-1}>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              Weekly eligible days compared to cumulative progress toward your goal.
            </TooltipContent>
          </UITooltip>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
              Days/week
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-5 h-0.5"
                style={{ backgroundColor: 'hsl(var(--chart-4))' }}
              />
              Cumulative
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-5 h-0.5 border-t-2 border-dashed"
                style={{ borderColor: 'hsl(var(--chart-4))' }}
              />
              Prediction
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-5 h-0.5 border-t-2 border-dashed border-muted-foreground/50" />
              Goal: {daysRequired} days
            </span>
          </div>
          {/* Week badge */}
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-info-light text-info whitespace-nowrap">
            Week {weeksElapsed} / {totalWeeks}
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={chartData}
          margin={{ top: 4, right: 40, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="xLabel"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 7]}
            ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={20}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, yRightMax]}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar
            yAxisId="left"
            dataKey="eligibleDays"
            name="Days/week"
            fill="hsl(var(--primary))"
            radius={[2, 2, 0, 0]}
            maxBarSize={20}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            name="Cumulative"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="predictionLine"
            name="Prediction"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            connectNulls={false}
          />
          <ReferenceLine
            yAxisId="right"
            y={daysRequired}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 3"
            opacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
