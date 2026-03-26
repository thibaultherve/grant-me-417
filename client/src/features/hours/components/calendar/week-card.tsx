import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { WeekData, VisaPeriod } from '../../types/weekly';
import { MobileWeekStats } from './week-totals';
import { EmployerHoursRowMobile } from './employer-hours-row';
import {
  formatWeekLabel,
  buildDayBars,
  isInMonth,
} from '../../utils/weekly-helpers';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface WeekCardProps {
  week: WeekData;
  visas: VisaPeriod[];
  isExpanded: boolean;
  onToggle: () => void;
  year: number;
  month: number;
}

/**
 * Mobile week card matching Pencil design:
 * - Top: week label + pencil edit icon
 * - Stats: 3 labeled columns (Total / Eligible / Days)
 * - Daily hours grid (7 days + chevron) separated by top border
 * - Visa color strip
 * - Employer breakdown (expanded)
 */
export const WeekCard = memo(function WeekCard({
  week,
  visas,
  isExpanded,
  onToggle,
  year,
  month,
}: WeekCardProps) {
  const navigate = useNavigate();
  const hasData = week.totalHours > 0;
  const dayBars = buildDayBars(week.dates, visas);

  return (
    <div
      className={cn(
        'rounded-lg border shadow-sm overflow-hidden',
        isExpanded ? 'bg-[#F8F6FF]' : 'bg-card',
      )}
    >
      {/* Top section: header + stats */}
      <div className="px-3.5 pt-3 pb-2 space-y-2">
        {/* Header: chevron + week label + edit button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {hasData ? (
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Collapse week' : 'Expand week'}
                className="p-0 bg-transparent border-none cursor-pointer shrink-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <span className="text-[13px] font-semibold text-foreground">
              {formatWeekLabel(week.weekStart, week.weekEnd)}
            </span>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-muted/50"
            onClick={() => navigate(`/hours/edit?week=${week.weekStart}`)}
            aria-label={`Edit week ${week.weekStart}`}
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        {/* Stats row: Total / Eligible / Days as labeled columns */}
        <MobileWeekStats
          totalHours={week.totalHours}
          visaBreakdown={week.visaBreakdown}
        />
      </div>

      {/* Daily hours grid + chevron — separated by top border */}
      <div className="border-t px-3.5 pt-2.5 pb-2.5">
        <div className="flex gap-0.5">
          {/* 7 day columns */}
          {week.dates.map((date, i) => (
            <div
              key={date}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5',
                !isInMonth(date, year, month) && 'opacity-40',
              )}
            >
              <span className="text-[10px] font-normal text-muted-foreground">
                {DAY_LABELS[i]}
              </span>
              <span className="relative">
                <span className={cn(
                  'tabular-nums text-xs',
                  week.dailyTotals[date] ? 'font-semibold text-foreground' : 'text-muted-foreground/50',
                )}>
                  {week.dailyTotals[date] ? String(week.dailyTotals[date]) : '–'}
                </span>
                {dayBars[i].visaType && (
                  <span
                    className={cn(
                      'absolute left-1/2 -translate-x-1/2 -bottom-1 h-[5px] w-[5px] rounded-full',
                      dayBars[i].color,
                    )}
                  />
                )}
              </span>
            </div>
          ))}

        </div>
      </div>

      {/* Employer breakdown (expanded) */}
      {isExpanded && week.employers.length > 0 && (
        <div className="border-t px-3.5 py-1">
          {week.employers.map((employer) => (
            <EmployerHoursRowMobile
              key={employer.employerId}
              employer={employer}
              dates={week.dates}
            />
          ))}
        </div>
      )}
    </div>
  );
});
