import { CalendarDays, Hourglass } from 'lucide-react';
import type { VisaOverview } from '@get-granted/shared';
import {
  calcProgressPct,
  formatShortDate,
} from '../utils/dashboard-calculations';
import { StatCardWrapper } from './stat-card-wrapper';

interface VisaTimelineCardProps {
  visa: VisaOverview['visa'];
  timeline: VisaOverview['timeline'];
}

export function VisaTimelineCard({ visa, timeline }: VisaTimelineCardProps) {
  const { arrivalDate, expiryDate } = visa;
  const { totalDays, daysElapsed, daysLeft } = timeline;

  const pct = calcProgressPct(daysElapsed, totalDays);
  const expired = daysLeft <= 0;

  return (
    <StatCardWrapper
      icon={Hourglass}
      iconVariant={expired ? 'danger' : 'warning'}
      title="Visa Timeline"
      tooltip="Time remaining on your current visa. Your visa is valid for 1 year from your arrival date."
      badge={expired ? 'Expired' : `${pct}% elapsed`}
      badgeVariant={expired ? 'danger' : 'warning'}
    >
      {/* Value row */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold text-foreground leading-none">
          {expired ? Math.abs(daysLeft) : daysLeft}
        </span>
        <span className="text-sm text-muted-foreground">
          {expired ? 'days ago' : 'days left'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-bar-track overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${expired ? 'bg-danger' : 'bg-warning'}`}
          style={{ width: `${expired ? 100 : pct}%` }}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarDays className="w-3 h-3" />
          {formatShortDate(arrivalDate)}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CalendarDays className="w-3 h-3" />
          {formatShortDate(expiryDate)}
        </span>
      </div>
    </StatCardWrapper>
  );
}
