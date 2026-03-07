import { Equal, Flag, TrendingDown, TrendingUp } from 'lucide-react';
import type { VisaOverview } from '@get-granted/shared';
import { getPaceStatus, calcProgressPct } from '../utils/dashboard-calculations';
import { StatCardWrapper } from './stat-card-wrapper';
import type { IconVariant, BadgeVariant } from './stat-card-wrapper';

interface PaceTrackerCardProps {
  pace: VisaOverview['pace'];
}

function formatPaceDelta(delta: number, pct: number, status: string): string {
  if (status === 'at-pace') {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${Math.round(pct)}% on pace`;
  }
  const sign = delta >= 0 ? '+' : '-';
  return `${sign}${Math.abs(delta).toFixed(2)} days/wk`;
}

export function PaceTrackerCard({ pace }: PaceTrackerCardProps) {
  const { currentPace, requiredPace } = pace;
  const { status, delta, pct } = getPaceStatus(pace);

  const config = {
    good: {
      icon: TrendingUp,
      iconVariant: 'success' as IconVariant,
      badgeVariant: 'success' as BadgeVariant,
      statusColor: 'text-success',
      barColor: 'bg-success',
      statusLabel: 'Good Pace',
    },
    'at-pace': {
      icon: Equal,
      iconVariant: 'info' as IconVariant,
      badgeVariant: 'info' as BadgeVariant,
      statusColor: 'text-info',
      barColor: 'bg-info',
      statusLabel: 'At Pace',
    },
    low: {
      icon: TrendingDown,
      iconVariant: 'warning' as IconVariant,
      badgeVariant: 'warning' as BadgeVariant,
      statusColor: 'text-warning',
      barColor: 'bg-warning',
      statusLabel: 'Low Pace',
    },
  }[status];

  const badge = formatPaceDelta(delta, pct, status);

  // Scale both bars relative to the larger value
  const maxPace = Math.max(currentPace, requiredPace, 0.1);
  const currentPct = calcProgressPct(currentPace, maxPace);
  const requiredPct = calcProgressPct(requiredPace, maxPace);

  return (
    <StatCardWrapper
      icon={config.icon}
      iconVariant={config.iconVariant}
      title="Pace Tracker"
      tooltip="Compares your average eligible days per week with the required pace to reach your goal by visa expiry."
      badge={badge}
      badgeVariant={config.badgeVariant}
    >
      {/* Status label */}
      <div className={`text-2xl font-bold leading-none ${config.statusColor}`}>
        {config.statusLabel}
      </div>

      {/* Pace rows */}
      <div className="flex flex-col gap-2">
        {/* Your pace */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20 shrink-0 flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border-2 border-muted-foreground shrink-0" />
            Your pace
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-bar-track overflow-hidden">
            <div
              className={`h-full rounded-full ${config.barColor}`}
              style={{ width: `${currentPct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-foreground w-20 text-right shrink-0">
            {currentPace.toFixed(2)} days/wk
          </span>
        </div>
        {/* Required */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20 shrink-0 flex items-center gap-1">
            <Flag className="w-3 h-3 shrink-0 text-muted-foreground" />
            Required
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-bar-track overflow-hidden">
            <div
              className="h-full rounded-full bg-info"
              style={{ width: `${requiredPct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-foreground w-20 text-right shrink-0">
            {requiredPace.toFixed(2)} days/wk
          </span>
        </div>
      </div>
    </StatCardWrapper>
  );
}
