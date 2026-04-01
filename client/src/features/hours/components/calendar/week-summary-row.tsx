import { ChevronDown, Pencil } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { VisaPeriod, WeekData } from '../../types/weekly';
import {
  buildDayBars,
  formatWeekLabel,
  getVisaBarColor,
  getWeekVisaInfo,
  isInMonth,
  VISA_BADGE_BG,
  VISA_TEXT_COLORS,
} from '../../utils/weekly-helpers';

import { HoursCell } from './hours-cell';
import { VisaValues } from './week-totals';

interface WeekSummaryRowProps {
  week: WeekData;
  visas: VisaPeriod[];
  isExpanded: boolean;
  onToggle: () => void;
  year: number;
  month: number;
}

/**
 * Desktop table row for a single week — collapsed summary view.
 * Shows week label, 7 day cells with hours, visa color bars,
 * total/eligible/days badges, edit button, and expand chevron.
 */
export const WeekSummaryRow = memo(function WeekSummaryRow({
  week,
  visas,
  isExpanded,
  onToggle,
  year,
  month,
}: WeekSummaryRowProps) {
  const navigate = useNavigate();
  const hasData = week.totalHours > 0;
  const dayBars = buildDayBars(week.dates, visas);
  const { visaTypes, showPerDayDots } = getWeekVisaInfo(week.dates, visas);

  return (
    <tr
      className={cn(
        'border-0 group transition-colors',
        isExpanded
          ? 'bg-primary-light'
          : hasData && 'hover:bg-primary-light/50',
        hasData && 'cursor-pointer',
      )}
      onClick={hasData ? onToggle : undefined}
    >
      {/* Week label + chevron — with left accent border */}
      <td
        className={cn(
          'pt-3 pb-1 px-4 text-[13px] text-foreground whitespace-nowrap w-22.5 border-l-[3px] transition-colors',
          isExpanded
            ? 'font-semibold border-l-primary'
            : hasData
              ? 'font-medium border-l-transparent group-hover:border-l-primary/40'
              : 'font-medium border-l-transparent',
        )}
      >
        <div className="flex items-center gap-1">
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              !hasData && 'invisible',
              isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground',
            )}
          />
          {formatWeekLabel(week.weekStart, week.weekEnd)}
        </div>
      </td>

      {/* Visa dots column */}
      <td className="pt-3 pb-1 w-10">
        <div className="flex items-center justify-center gap-1">
          {visaTypes.map((vt) => (
            <span
              key={vt}
              className={cn('h-1.25 w-1.25 rounded-full', getVisaBarColor(vt))}
            />
          ))}
        </div>
      </td>

      {/* Total Hours — center-aligned, muted */}
      <td className="pt-3 pb-1 text-center w-17.5">
        {hasData && (
          <span className="tabular-nums text-[13px] font-semibold text-muted-foreground">
            {`${week.totalHours}h`}
          </span>
        )}
      </td>

      {/* Eligible Hours — center-aligned, per-visa colored text */}
      <td className="pt-3 pb-1 text-center w-18.75">
        {hasData && (
          <div className="flex items-center gap-0.5 justify-center">
            <VisaValues
              breakdown={week.visaBreakdown}
              getValue={(vb) => `${vb.eligibleHours}h`}
              getNumber={(vb) => vb.eligibleHours}
              showDots={showPerDayDots}
            />
          </div>
        )}
      </td>

      {/* Eligible Days — center-aligned, bold foreground */}
      <td className="pt-3 pb-1 text-center w-18.75">
        {hasData && (
          <div className="flex items-center gap-0.5 justify-center">
            <VisaValues
              breakdown={week.visaBreakdown}
              getValue={(vb) => `${vb.eligibleDays}d`}
              getNumber={(vb) => vb.eligibleDays}
              showDots={showPerDayDots}
              bold
            />
          </div>
        )}
      </td>

      {/* Separator */}
      <td className="w-4 pt-3 pb-1">
        {hasData && <div className="h-3.5 w-px bg-border mx-auto" />}
      </td>

      {/* Daily hours (Mon-Sun) or empty state */}
      {hasData ? (
        week.dates.map((date, i) => (
          <td
            key={date}
            className={cn(
              'pt-3 pb-1 text-center',
              !isInMonth(date, year, month) && 'opacity-40',
            )}
          >
            <span className="relative inline-flex justify-center">
              <HoursCell hours={week.dailyTotals[date]} />
              {dayBars[i].visaType && dayBars[i].boundary ? (
                <span
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 -bottom-2.5 rounded-full px-1.5 py-px text-[8px] font-semibold leading-tight whitespace-nowrap',
                    VISA_BADGE_BG[dayBars[i].visaType!],
                    VISA_TEXT_COLORS[dayBars[i].visaType!],
                  )}
                >
                  {dayBars[i].boundary}
                </span>
              ) : showPerDayDots && dayBars[i].visaType ? (
                <span
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 -bottom-1 h-1.25 w-1.25 rounded-full',
                    dayBars[i].color,
                  )}
                />
              ) : null}
            </span>
          </td>
        ))
      ) : (
        <td
          colSpan={7}
          className="pt-3 pb-1 text-center text-xs text-muted-foreground/50"
        >
          No hours logged
        </td>
      )}

      {/* Actions: edit button */}
      <td className="pt-3 pb-1 pr-4 w-14">
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/app/hours/edit?week=${week.weekStart}`);
            }}
            aria-label={`Edit week ${week.weekStart}`}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
});
