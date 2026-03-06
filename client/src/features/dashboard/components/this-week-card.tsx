import { CalendarDays } from 'lucide-react';
import type { VisaOverview } from '@get-granted/shared';
import { formatHours } from '../utils/dashboard-calculations';
import { StatCardWrapper } from './stat-card-wrapper';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MAX_BAR_HEIGHT = 40; // px
const MAX_HOURS_REF = 10; // hours at which bar reaches full height

function getBarColorClass(hours: number): string {
  if (hours === 0) return 'bg-bar-track';
  if (hours <= 5) return 'bg-bar-low';
  if (hours <= 8) return 'bg-primary';
  return 'bg-bar-high';
}

function getHoursLabelClass(hours: number): string {
  if (hours === 0) return 'text-muted-foreground';
  if (hours <= 5) return 'text-bar-low';
  if (hours <= 8) return 'text-primary';
  return 'text-bar-high';
}

function getBarHeight(hours: number): number {
  if (hours === 0) return 4;
  return Math.min(Math.round((hours / MAX_HOURS_REF) * MAX_BAR_HEIGHT), MAX_BAR_HEIGHT);
}

interface ThisWeekCardProps {
  thisWeek: VisaOverview['thisWeek'];
}

export function ThisWeekCard({ thisWeek }: ThisWeekCardProps) {
  const { totalHours, eligibleDays, dailyHours, nextThreshold } = thisWeek;

  // Build 7-day array (Mon=1 to Sun=7), filling missing days with 0
  const days = Array.from({ length: 7 }, (_, i) => {
    const dayOfWeek = i + 1;
    const entry = dailyHours.find((d) => d.dayOfWeek === dayOfWeek);
    return { dayOfWeek, hours: entry?.hours ?? 0, date: entry?.date };
  });

  return (
    <StatCardWrapper
      icon={CalendarDays}
      iconVariant="info"
      title="This Week"
      tooltip="Hours worked this week and how they translate to eligible days. Thresholds: 6h=1d, 12h=2d, 18h=3d, 24h=4d, 30h=7d."
      badge={`${eligibleDays} eligible day${eligibleDays !== 1 ? 's' : ''}`}
      badgeVariant="info"
    >
      {/* Value + hint row */}
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground leading-none">
            {formatHours(totalHours)}
          </span>
          <span className="text-sm text-muted-foreground">/ 30h</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {nextThreshold && (
            <span className="text-xs text-warning">
              ✦ Need {formatHours(nextThreshold.hoursNeeded)} more →{' '}
              {nextThreshold.eligibleDays} days
            </span>
          )}
          <span className="text-xs text-warning">◎ 30h goal</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-1 flex-1">
        {days.map((day, idx) => {
          const height = getBarHeight(day.hours);
          const barColorClass = getBarColorClass(day.hours);
          const labelColorClass = getHoursLabelClass(day.hours);
          const dateLabel = day.date
            ? new Date(day.date).toLocaleDateString('en-AU', {
                day: '2-digit',
                month: '2-digit',
              })
            : null;

          return (
            <div key={idx} className="flex flex-col items-center gap-0.5 flex-1">
              {/* Hours label */}
              <span className={`text-[10px] font-medium leading-none ${labelColorClass}`}>
                {day.hours > 0 ? formatHours(day.hours) : ''}
              </span>
              {/* Bar */}
              <div
                className={`w-full rounded-sm ${barColorClass}`}
                style={{ height: `${height}px` }}
              />
              {/* Day label */}
              <span className="text-[10px] text-muted-foreground leading-none font-medium">
                {DAY_LABELS[idx]}
              </span>
              {/* Date label */}
              {dateLabel && (
                <span className="text-[9px] text-muted-foreground/60 leading-none">
                  {dateLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </StatCardWrapper>
  );
}
