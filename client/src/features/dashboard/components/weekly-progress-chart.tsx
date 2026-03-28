import {
  TooltipContent,
  TooltipTrigger,
  Tooltip as UITooltip,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { visaHasGoal, type VisaOverview } from '@regranted/shared';
import { BarChart2, HelpCircle } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildWeeklyProgressChartData } from '../utils/dashboard-calculations';
import { CardTooltip } from './stat-card-wrapper';

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
  const { daysRequired, visaType } = visa;
  const hasGoal = visaHasGoal(visaType);

  const raw = buildWeeklyProgressChartData(
    weeklyProgress,
    currentPace,
    hasGoal ? weeksRemaining : 0,
    daysRequired,
  );

  const chartData = raw.map((p, i) => {
    const isLastActual =
      !p.isPrediction && (i === raw.length - 1 || raw[i + 1]?.isPrediction);

    return {
      xLabel: p.label,
      eligibleDays: !p.isPrediction ? p.eligibleDays : undefined,
      cumulative: !p.isPrediction ? p.cumulativeEligibleDays : undefined,
      predictionLine:
        hasGoal && (p.isPrediction || isLastActual) ? p.cumulativeEligibleDays : undefined,
    };
  });

  const maxCumulative = Math.max(...chartData.map(d => d.cumulative ?? d.predictionLine ?? 0));
  const yRightMax = hasGoal ? Math.max(maxCumulative + 10, daysRequired + 10) : undefined;

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
            <TooltipContent
              side="top"
              className="w-60 bg-popover border border-border rounded-lg p-0 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.08),0_16px_24px_-6px_rgba(0,0,0,0.04)]"
            >
              <CardTooltip title="Weekly Progress">
                <p className="mb-2">
                  Bars show eligible days earned each week. The line tracks your
                  cumulative total toward the goal — dashed where it's a
                  projection at your current pace.
                </p>
              </CardTooltip>
            </TooltipContent>
          </UITooltip>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: 'linear-gradient(to right, var(--bar-1), var(--bar-7))' }}
              />
              Days/week
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-5 h-0.5"
                style={{ backgroundColor: 'var(--chart-4)' }}
              />
              Cumulative
            </span>
            {hasGoal && (
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-5 h-0.5 border-t-2 border-dashed"
                  style={{ borderColor: 'var(--chart-4)' }}
                />
                Prediction
              </span>
            )}
            {hasGoal && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-5 h-0.5 bg-success/70" />
                Goal: {daysRequired} days
              </span>
            )}
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
            stroke="var(--border)"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="xLabel"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 7]}
            ticks={[0, 1, 2, 3, 4, 5, 7]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={20}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, yRightMax ?? 'auto']}
            ticks={hasGoal ? [0, Math.round(daysRequired / 2), daysRequired] : undefined}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={36}
            hide={!hasGoal}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--foreground)',
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar
            yAxisId="left"
            dataKey="eligibleDays"
            name="Days/week"
            radius={[6, 6, 6, 6]}
            maxBarSize={20}
          >
            {chartData.map((entry, index) => {
              const days = Math.min(Math.max(Math.round(entry.eligibleDays ?? 0), 1), 7);
              return (
                <Cell
                  key={index}
                  fill={entry.eligibleDays ? `var(--bar-${days})` : 'transparent'}
                />
              );
            })}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            name="Cumulative"
            stroke="var(--chart-4)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          {hasGoal && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="predictionLine"
              name="Prediction"
              stroke="var(--chart-4)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              connectNulls={false}
            />
          )}
          {hasGoal && (
            <ReferenceLine
              yAxisId="right"
              y={daysRequired}
              stroke="var(--success)"
              strokeWidth={1.5}
              opacity={0.7}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
