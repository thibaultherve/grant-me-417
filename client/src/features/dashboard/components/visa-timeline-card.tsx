import { Hourglass, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import type { VisaOverview } from '@get-granted/shared';
import {
  calcProgressPct,
  formatDate,
} from '../utils/dashboard-calculations';
import { StatCardWrapper, CardTooltip } from './stat-card-wrapper';

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
      tooltip={
        <CardTooltip title="Visa Timeline">
          Time remaining on your current visa, from your arrival date to expiry (both dates inclusive). Your visa covers exactly 1 year from the day you arrived.
        </CardTooltip>
      }
      badge={expired ? 'Expired' : `${pct}% elapsed`}
      badgeVariant={expired ? 'danger' : 'warning'}
    >
      {/* Value row */}
      <div className="flex items-end gap-1.5">
        <span className="text-4xl font-bold text-foreground leading-none tracking-tight">
          {expired ? Math.abs(daysLeft) : daysLeft}
        </span>
        <span className="text-sm text-muted-foreground">
          {expired ? 'days ago' : 'days left'}
        </span>
      </div>

      {/* Bottom section — pushed to bottom */}
      <div className="flex flex-col gap-1.5 mt-auto">
        <div className="h-2 w-full rounded-full bg-bar-track overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${expired ? 'bg-danger' : 'bg-warning'}`}
            style={{ width: `${expired ? 100 : pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <PlaneLanding className="w-3 h-3" />
            {formatDate(arrivalDate)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <PlaneTakeoff className="w-3 h-3" />
            {formatDate(expiryDate)}
          </span>
        </div>
      </div>
    </StatCardWrapper>
  );
}
