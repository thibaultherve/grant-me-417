import type { VisaOverview } from '@regranted/shared';
import { Equal, Minus, Target, TrendingDown, TrendingUp } from 'lucide-react';
import {
  calcProgressPct,
  getPaceStatus,
} from '../utils/dashboard-calculations';
import type { BadgeVariant, IconVariant } from './stat-card-wrapper';
import { CardTooltip, StatCardWrapper } from './stat-card-wrapper';

interface PaceTrackerCardProps {
  pace: VisaOverview['pace'];
}

function formatPaceDelta(delta: number, pct: number, status: string): string {
  if (status === 'no-data') return 'No data yet';
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
    'no-data': {
      icon: Minus,
      iconVariant: 'muted' as IconVariant,
      badgeVariant: 'muted' as BadgeVariant,
      statusColor: 'text-muted-foreground',
      barColor: 'bg-muted-foreground',
      statusLabel: 'No Pace',
    },
  }[status];

  const badge = formatPaceDelta(delta, pct, status);

  const scale = 2 * requiredPace;
  const currentPct = calcProgressPct(currentPace, scale);

  return (
    <StatCardWrapper
      icon={config.icon}
      iconVariant={config.iconVariant}
      title="Pace Tracker"
      tooltip={
        <CardTooltip title="Pace Tracker">
          <p className="mb-2">The <span className="font-medium text-foreground">pace status</span> is based on the % difference between <span className="font-medium text-foreground">your pace</span> and the <span className="font-medium text-foreground">target pace</span>:</p>
          <div className="flex flex-col gap-0.5 border-t border-border pt-2 mb-2">
            <ul className="flex flex-col gap-0.5">
              <li>
                <span className="font-medium text-warning">Low Pace</span> —
                more than 5% below
              </li>
              <li>
                <span className="font-medium text-info">At Pace</span> — within
                ±5%
              </li>
              <li>
                <span className="font-medium text-success">Good Pace</span> —
                more than 5% above
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground shrink-0">
                Your Pace
              </span>
              <span>=</span>
              <div className="flex flex-col items-center text-center leading-tight">
                <span>total eligible days</span>
                <span className="w-full border-t border-muted-foreground/40 my-0.5" />
                <span>weeks elapsed</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground shrink-0">
                Target Pace
              </span>
              <span>=</span>
              <div className="flex flex-col items-center text-center leading-tight">
                <span>days required</span>
                <span className="w-full border-t border-muted-foreground/40 my-0.5" />
                <span>visa duration (52 weeks · 1 year)</span>
              </div>
            </div>
          </div>
        </CardTooltip>
      }
      badge={badge}
      badgeVariant={config.badgeVariant}
    >
      {/* Status label */}
      <div
        className={`text-2xl font-bold leading-none tracking-tight ${config.statusColor}`}
      >
        {config.statusLabel}
      </div>

      {/* Pace rows — pushed to bottom */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Your pace */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs leading-none text-muted-foreground flex items-center gap-1">
              <Target className={`w-3 h-3 shrink-0 ${config.statusColor}`} />
              Your pace
            </span>
            <span className="text-xs leading-none font-semibold text-foreground">
              {currentPace.toFixed(2)} days/wk
            </span>
          </div>
          {/* Gradient bar — full width, highlighted up to currentPct */}
          <div className="relative h-2 w-full rounded-full overflow-hidden">
            {/* Full gradient — dimmed background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, #F59E0B 0% 47.5%, #3B82F6 47.5% 52.5%, #10B981 52.5% 100%)',
                opacity: 0.2,
              }}
            />
            {/* Full gradient — highlighted fill clipped to current value */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, #F59E0B 0% 47.5%, #3B82F6 47.5% 52.5%, #10B981 52.5% 100%)',
                clipPath: `inset(0 ${100 - currentPct}% 0 0)`,
                transition: 'clip-path 0.3s ease',
              }}
            />
          </div>
          {/* Zone legend */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 mt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
              Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-info shrink-0" />
              At pace · {requiredPace.toFixed(2)} days/wk{' '}
              <span className="opacity-60">±5%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              Good
            </span>
          </div>
        </div>
      </div>
    </StatCardWrapper>
  );
}
