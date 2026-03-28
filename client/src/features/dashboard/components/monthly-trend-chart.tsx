import { TrendingUp, HelpCircle } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VisaOverview } from '@regranted/shared';
import { buildMonthlyTrendChartData } from '../utils/dashboard-calculations';
import { cn } from '@/lib/utils';

interface MonthlyTrendChartProps {
  monthlyTrend: VisaOverview['monthlyTrend'];
  daysRequired: number;
  className?: string;
}

export function MonthlyTrendChart({
  monthlyTrend,
  daysRequired,
  className,
}: MonthlyTrendChartProps) {
  const hasGoal = daysRequired > 0;
  const chartData = buildMonthlyTrendChartData(monthlyTrend, daysRequired);

  const yMax =
    chartData.length > 0
      ? Math.max(
          ...chartData.map((d) => Math.max(d.eligibleDays, hasGoal ? d.idealPace : 0)),
        ) + 5
      : 30;

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
            <TrendingUp className="w-4 h-4 text-info" />
          </div>
          <span className="text-sm font-semibold text-foreground leading-none">
            Monthly Trend
          </span>
          <UITooltip>
            <TooltipTrigger asChild>
              <button className="focus:outline-none" tabIndex={-1}>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              Monthly eligible days compared to the ideal pace needed to reach your goal.
            </TooltipContent>
          </UITooltip>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
            Eligible days
          </span>
          {hasGoal && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-5 h-0.5 border-t-2 border-dashed border-muted-foreground/60" />
              Ideal pace
            </span>
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No monthly data available yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(yMax)]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={32}
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
              dataKey="eligibleDays"
              name="Eligible days"
              fill="var(--primary)"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
            />
            {hasGoal && (
              <Line
                type="monotone"
                dataKey="idealPace"
                name="Ideal pace"
                stroke="var(--muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                opacity={0.6}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
