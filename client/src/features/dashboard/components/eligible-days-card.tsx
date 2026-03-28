import { visaHasGoal, type VisaOverview } from '@regranted/shared';
import { Award, CalendarCheck, CircleCheck, Target } from 'lucide-react';
import { calcProgressPct } from '../utils/dashboard-calculations';
import { CardTooltip, StatCardWrapper } from './stat-card-wrapper';

const NEXT_VISA_LABEL: Record<string, string> = {
  first_whv: '2nd WHV',
  second_whv: '3rd WHV',
};

interface EligibleDaysCardProps {
  visa: VisaOverview['visa'];
}

export function EligibleDaysCard({ visa }: EligibleDaysCardProps) {
  const { eligibleDays, daysRequired, daysRemaining, isEligible, visaType } =
    visa;
  const hasGoal = visaHasGoal(visaType);
  const pct = hasGoal ? calcProgressPct(eligibleDays, daysRequired) : 0;
  const completed = hasGoal && isEligible;

  return (
    <StatCardWrapper
      icon={hasGoal ? CircleCheck : CalendarCheck}
      iconVariant={completed ? 'success' : 'info'}
      title="Eligible Days"
      tooltip={
        <CardTooltip title="Eligible Days">
          <p className="mb-2">
            Each week, your total hours are converted into{' '}
            <span className="font-medium text-foreground">eligible days</span>.
            This card shows the{' '}
            <span className="font-medium text-foreground">
              cumulative total
            </span>{' '}
            of all eligible days earned since you arrived.
          </p>
          <div className="flex flex-col gap-1.5 border-t border-border pt-2">
            <p className="font-medium text-foreground">
              Weekly hour thresholds
            </p>
            <ul className="flex flex-col gap-0.5">
              <li>
                6h – 11h →{' '}
                <span className="font-medium text-foreground">1 day</span>
              </li>
              <li>
                12h – 17h →{' '}
                <span className="font-medium text-foreground">2 days</span>
              </li>
              <li>
                18h – 23h →{' '}
                <span className="font-medium text-foreground">3 days</span>
              </li>
              <li>
                24h – 29h →{' '}
                <span className="font-medium text-foreground">4 days</span>
              </li>
              <li>
                30h+ →{' '}
                <span className="font-medium text-foreground">
                  7 days (full week)
                </span>
              </li>
            </ul>
          </div>
        </CardTooltip>
      }
      badge={hasGoal ? (completed ? 'completed' : `${pct}% complete`) : undefined}
      badgeVariant={completed ? 'success' : 'info'}
    >
      {/* Value row */}
      <div className="flex items-end gap-1.5">
        <span className="text-4xl font-bold text-foreground leading-none tracking-tight">
          {eligibleDays}
        </span>
        <span className="text-sm text-muted-foreground">
          {hasGoal ? `/ ${daysRequired} days` : 'days earned'}
        </span>
      </div>

      {/* Bottom section — pushed to bottom */}
      <div className="flex flex-col gap-1.5 mt-auto">
        {hasGoal && (
          <div className="h-2 w-full rounded-full bg-bar-track overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completed ? 'bg-success' : 'bg-info'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3" />
            {hasGoal
              ? completed ? 'Goal reached!' : `${daysRemaining} remaining`
              : 'No day requirement'
            }
          </span>
          {NEXT_VISA_LABEL[visaType] && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
              <Award className="w-3 h-3" />
              {NEXT_VISA_LABEL[visaType]}
            </span>
          )}
        </div>
      </div>
    </StatCardWrapper>
  );
}
