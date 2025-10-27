import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { useVisaWeeklyProgress } from "../hooks/use-visa-weekly-progress";

interface ChartData {
  week: string;
  eligible_days: number;
  hours: number;
  eligible_hours: number;
  days_worked: number;
  full_date: string;
}

export const WeeklyProgressChart = () => {
  const { weeklyProgress, loading } = useVisaWeeklyProgress();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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
  const chartData: ChartData[] = weeklyProgress.map((week) => {
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

  // Modern neutral color scheme - NO yellow, only grays and greens
  const getBarColor = (eligibleDays: number, isHovered: boolean) => {
    const opacity = isHovered ? "1" : "0.9";
    if (eligibleDays === 7) return `rgba(34, 197, 94, ${opacity})`; // green-500 (full week)
    if (eligibleDays >= 5) return `rgba(74, 222, 128, ${opacity})`; // green-400 (5-6 days)
    if (eligibleDays >= 3) return `rgba(134, 239, 172, ${opacity})`; // green-300 (3-4 days)
    if (eligibleDays >= 1) return `rgba(156, 163, 175, ${opacity})`; // gray-400 (1-2 days)
    return "transparent"; // 0 days
  };

  const maxDays = 7;
  const chartHeight = 300;
  const barWidth = Math.min(40, Math.floor((100 / chartData.length) * 8));

  const formatTooltipDate = (dateString: string) => {
    const weekStart = new Date(dateString);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    };

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
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
      <CardContent className="overflow-hidden">
        {/* Custom Bar Chart */}
        <div className="relative w-full" style={{ height: chartHeight + 40 }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-muted-foreground w-8">
            {[7, 4, 3, 2, 1, 0].map((tick) => (
              <div key={tick} className="text-right pr-2">
                {tick}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="ml-10 relative overflow-hidden" style={{ height: chartHeight }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[7, 4, 3, 2, 1, 0].map((tick) => (
                <div
                  key={tick}
                  className="border-t border-border/40"
                  style={{ width: '100%' }}
                />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around px-2 overflow-x-auto">
              {chartData.map((data, index) => {
                const barHeight = (data.eligible_days / maxDays) * (chartHeight - 20);
                const isHovered = hoveredBar === index;

                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center justify-end"
                    style={{ width: `${barWidth}px` }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Bar */}
                    <div
                      style={{
                        height: barHeight,
                        backgroundColor: getBarColor(data.eligible_days, isHovered),
                        width: '100%',
                        borderRadius: '4px 4px 0 0',
                        cursor: data.eligible_days > 0 ? 'pointer' : 'default',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      }}
                      className="transition-all duration-200"
                    />

                    {/* Tooltip */}
                    {isHovered && data.eligible_days > 0 && (
                      <div
                        className="absolute bottom-full mb-2 bg-background border border-border rounded-lg shadow-lg p-3 space-y-1 z-10 min-w-[180px] transition-all duration-200"
                      >
                        <p className="font-semibold text-xs">
                          {formatTooltipDate(data.full_date)}
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">Eligible Days:</span>{" "}
                          {data.eligible_days}
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">Eligible Hours:</span>{" "}
                          {data.eligible_hours}h
                        </p>
                      </div>
                    )}

                    {/* X-axis label */}
                    <div className="mt-2 text-xs text-muted-foreground whitespace-nowrap">
                      {data.week}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend with neutral colors */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span className="text-muted-foreground">1-2 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-300" />
            <span className="text-muted-foreground">3-4 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-400" />
            <span className="text-muted-foreground">5-6 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-muted-foreground">7 days (full)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
