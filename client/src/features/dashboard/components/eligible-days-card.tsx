import { CircleCheck, Medal } from 'lucide-react';
import type { VisaOverview } from '@get-granted/shared';
import { calcProgressPct } from '../utils/dashboard-calculations';
import { StatCardWrapper } from './stat-card-wrapper';

const SHORT_VISA_LABELS: Record<string, string> = {
  first_whv: '1st WHV',
  second_whv: '2nd WHV',
  third_whv: '3rd WHV',
};

interface EligibleDaysCardProps {
  visa: VisaOverview['visa'];
}

export function EligibleDaysCard({ visa }: EligibleDaysCardProps) {
  const { eligibleDays, daysRequired, daysRemaining, isEligible, visaType } =
    visa;
  const pct = calcProgressPct(eligibleDays, daysRequired);
  const completed = isEligible;

  return (
    <StatCardWrapper
      icon={CircleCheck}
      iconVariant={completed ? 'success' : 'info'}
      title="Eligible Days"
      tooltip="Number of days counted as eligible work under WHV 417 rules. Based on weekly hours thresholds (6h=1d, 12h=2d, 18h=3d, 24h=4d, 30h=7d)."
      badge={completed ? 'completed' : `${pct}% complete`}
      badgeVariant={completed ? 'success' : 'info'}
    >
      {/* Value row */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold text-foreground leading-none">
          {eligibleDays}
        </span>
        <span className="text-sm text-muted-foreground">/ {daysRequired} days</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-bar-track overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${completed ? 'bg-success' : 'bg-info'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CircleCheck className="w-3 h-3" />
          {completed ? 'Goal reached!' : `${daysRemaining} remaining`}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Medal className="w-3 h-3" />
          {SHORT_VISA_LABELS[visaType] ?? visaType}
        </span>
      </div>
    </StatCardWrapper>
  );
}
