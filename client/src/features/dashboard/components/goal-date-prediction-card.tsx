import { Flag } from 'lucide-react';
import type { VisaOverview } from '@regranted/shared';
import { cn } from '@/lib/utils';
import type { GoalPredictionStatus } from '../types';
import { computeGoalDatePrediction, formatDate, formatShortDate } from '../utils/dashboard-calculations';
import type { BadgeVariant, IconVariant } from './stat-card-wrapper';
import { CardTooltip, StatCardWrapper } from './stat-card-wrapper';

interface GoalDatePredictionCardProps {
  visa: VisaOverview['visa'];
  pace: VisaOverview['pace'];
}

const STATUS_CONFIG: Record<
  GoalPredictionStatus,
  {
    iconVariant: IconVariant;
    badgeVariant: BadgeVariant;
    badgeText: string;
    colorClass: string;
    barBgClass: string;
    dateColorClass: string;
  }
> = {
  'on-track': {
    iconVariant: 'success',
    badgeVariant: 'success',
    badgeText: 'On track',
    colorClass: 'text-success',
    barBgClass: 'bg-success',
    dateColorClass: 'text-foreground',
  },
  tight: {
    iconVariant: 'info',
    badgeVariant: 'info',
    badgeText: 'Tight',
    colorClass: 'text-info',
    barBgClass: 'bg-info',
    dateColorClass: 'text-foreground',
  },
  'at-risk': {
    iconVariant: 'warning',
    badgeVariant: 'warning',
    badgeText: 'At risk',
    colorClass: 'text-warning',
    barBgClass: 'bg-warning',
    dateColorClass: 'text-warning',
  },
  completed: {
    iconVariant: 'success',
    badgeVariant: 'success',
    badgeText: 'Completed',
    colorClass: 'text-success',
    barBgClass: 'bg-success',
    dateColorClass: 'text-success',
  },
  'no-data': {
    iconVariant: 'muted',
    badgeVariant: 'muted',
    badgeText: 'No data',
    colorClass: 'text-muted-foreground',
    barBgClass: 'bg-muted-foreground',
    dateColorClass: 'text-muted-foreground',
  },
  'no-goal': {
    iconVariant: 'muted',
    badgeVariant: 'muted',
    badgeText: 'No requirement',
    colorClass: 'text-muted-foreground',
    barBgClass: 'bg-muted-foreground',
    dateColorClass: 'text-muted-foreground',
  },
};

// Border color needs to use CSS variable directly since Tailwind border-{color} doesn't map to our custom tokens
const borderColorMap: Record<GoalPredictionStatus, string> = {
  'on-track': 'var(--color-success)',
  tight: 'var(--color-info)',
  'at-risk': 'var(--color-warning)',
  completed: 'var(--color-success)',
  'no-data': 'var(--color-muted-foreground)',
  'no-goal': 'var(--color-muted-foreground)',
};

export function GoalDatePredictionCard({ visa, pace }: GoalDatePredictionCardProps) {
  const prediction = computeGoalDatePrediction(visa, pace);
  const config = STATUS_CONFIG[prediction.status];

  const isEdgeState = prediction.status === 'no-goal' || prediction.status === 'no-data';

  return (
    <StatCardWrapper
      icon={Flag}
      iconVariant={config.iconVariant}
      title="Goal Date Prediction"
      tooltip={
        <CardTooltip title="Goal Date Prediction">
          Shows your projected date to reach the required eligible days based on your current weekly pace.
        </CardTooltip>
      }
      badge={config.badgeText}
      badgeVariant={config.badgeVariant}
    >
      {isEdgeState ? (
        /* ─── Edge states: No Goal / No Data ─── */
        <p className="text-sm text-muted-foreground">{prediction.subtextMessage}</p>
      ) : (
        <>
          {/* ─── Date section ─── */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  'text-[28px] font-bold leading-none tracking-tight',
                  config.dateColorClass,
                )}
              >
                {prediction.status === 'completed'
                  ? 'Goal Reached!'
                  : formatDate(prediction.projectedDate!.toISOString().split('T')[0])}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {prediction.subtextMessage}
              </span>
            </div>

            {/* Countdown pill */}
            <div
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 px-4 shrink-0"
              style={{ border: `1.5px solid ${borderColorMap[prediction.status]}` }}
            >
              <span className={cn('text-[22px] font-bold leading-none', config.colorClass)}>
                {prediction.countdownDays}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground leading-none">
                {prediction.countdownLabel}
              </span>
            </div>
          </div>

          {/* ─── Timeline section (pushed to bottom) ─── */}
          <div className="flex flex-col gap-1.5 mt-auto">
            {/* Bar */}
            <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn('absolute inset-y-0 left-0 rounded-full', config.barBgClass)}
                style={{
                  width: `${Math.round(prediction.timelineProgress * 100)}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            {/* Labels */}
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>
                {prediction.status === 'completed' ? 'Start' : 'Today'}
              </span>
              <span className={cn('font-semibold', config.colorClass)}>
                {prediction.goalLabel}
              </span>
              <span>
                Visa expiry · {formatShortDate(visa.expiryDate)}
              </span>
            </div>
          </div>
        </>
      )}
    </StatCardWrapper>
  );
}
