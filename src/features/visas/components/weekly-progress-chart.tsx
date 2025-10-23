import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useVisaWeeklyProgress } from "../hooks/use-visa-weekly-progress";

export const WeeklyProgressChart = () => {
  const { weeklyProgress, loading } = useVisaWeeklyProgress();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weeklyProgress || weeklyProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">
              No weekly data available yet. Start logging your work hours!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData = weeklyProgress.map((week) => {
    const startDate = new Date(week.week_start_date);
    const weekLabel = `${startDate.getDate()}/${startDate.getMonth() + 1}`;

    return {
      week: weekLabel,
      eligible_days: week.eligible_days,
      hours: week.hours,
      eligible_hours: week.eligible_hours,
      days_worked: week.days_worked,
      full_date: week.week_start_date,
    };
  });

  // Color based on eligible_days thresholds
  const getBarColor = (eligibleDays: number) => {
    if (eligibleDays === 7) return "#22c55e"; // green-500
    if (eligibleDays === 4) return "#3b82f6"; // blue-500
    if (eligibleDays === 3) return "#8b5cf6"; // violet-500
    if (eligibleDays === 2) return "#f59e0b"; // amber-500
    if (eligibleDays === 1) return "#ef4444"; // red-500
    return "#94a3b8"; // slate-400 (0 days)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Eligible Days Progress
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your eligible days week by week
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <style>{`
            .recharts-bar-rectangle:hover {
              filter: brightness(1.2);
              transition: filter 0.2s ease;
            }
          `}</style>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                domain={[0, 7]}
                ticks={[0, 1, 2, 3, 4, 7]}
              />
              <Bar dataKey="eligible_days" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.eligible_days === 0
                        ? "transparent"
                        : getBarColor(entry.eligible_days)
                    }
                  />
                ))}
              </Bar>
              <Tooltip
                cursor={false}
                wrapperStyle={{ outline: 'none' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;

                    // Don't show tooltip if eligible_days is 0
                    if (data.eligible_days === 0) {
                      return null;
                    }

                    const weekStart = new Date(data.full_date);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);

                    const formatDate = (date: Date) => {
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const year = String(date.getFullYear()).slice(-2);
                      return `${day}/${month}/${year}`;
                    };

                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                        <p className="font-semibold text-sm">
                          {formatDate(weekStart)} - {formatDate(weekEnd)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Eligible Days:</span>{" "}
                          {data.eligible_days}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Eligible Hours:</span>{" "}
                          {data.eligible_hours}h
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-400" />
            <span>0 days (&lt;6h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>1 day (6-11h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>2 days (12-17h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-violet-500" />
            <span>3 days (18-23h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>4 days (24-29h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>7 days (30h+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
