import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Pencil } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import type { WeekData, VisaPeriod } from '../../types/weekly';
import { HoursCell } from './hours-cell';
import { VisaValues } from './week-totals';
import {
  formatWeekLabel,
  buildDayBars,
  isInMonth,
} from '../../utils/weekly-helpers';

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

  return (
    <tr
      className={cn(
        'border-0 group',
        isExpanded && 'bg-[#F8F6FF]',
      )}
    >
      {/* Week label + chevron — 3px left accent border */}
      <td className={cn(
        'py-3 px-4 text-[13px] text-foreground whitespace-nowrap w-[90px] border-l-[3px]',
        isExpanded ? 'font-semibold border-l-primary' : 'font-medium border-l-transparent',
      )}>
        <div className="flex items-center gap-1">
          {hasData ? (
            <button
              onClick={onToggle}
              aria-label={isExpanded ? 'Collapse week' : 'Expand week'}
              aria-expanded={isExpanded}
              className="p-0 bg-transparent border-none cursor-pointer shrink-0"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground',
                )}
              />
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          {formatWeekLabel(week.weekStart, week.weekEnd)}
        </div>
      </td>

      {/* Daily hours (Mon-Sun) with optional visa dots */}
      {week.dates.map((date, i) => (
        <td
          key={date}
          className={cn(
            'py-3 text-center',
            !isInMonth(date, year, month) && 'opacity-40',
          )}
        >
          <span className="relative inline-flex justify-center">
            <HoursCell hours={week.dailyTotals[date]} />
            {dayBars[i].visaType && (
              <span
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 -bottom-1 h-[5px] w-[5px] rounded-full',
                  dayBars[i].color,
                )}
              />
            )}
          </span>
        </td>
      ))}

      {/* Separator */}
      <td className="w-4 py-3">
        <div className="h-3.5 w-px bg-border mx-auto" />
      </td>

      {/* Total — 60px, right-aligned, bold */}
      <td className="py-3 text-right w-[60px]">
        <span className="tabular-nums text-[13px] font-bold text-foreground">
          {week.totalHours > 0 ? `${week.totalHours}h` : '–'}
        </span>
      </td>

      {/* Eligible hours — 65px, per-visa colored text */}
      <td className="py-3 text-right w-[65px]">
        <div className="flex items-center gap-0.5 justify-end">
          <VisaValues
            breakdown={week.visaBreakdown}
            getValue={(vb) => `${vb.eligibleHours}h`}
            getNumber={(vb) => vb.eligibleHours}
          />
        </div>
      </td>

      {/* Eligible days — 50px, per-visa colored text */}
      <td className="py-3 text-right w-[50px]">
        <div className="flex items-center gap-0.5 justify-end">
          <VisaValues
            breakdown={week.visaBreakdown}
            getValue={(vb) => `${vb.eligibleDays}d`}
            getNumber={(vb) => vb.eligibleDays}
          />
        </div>
      </td>

      {/* Actions: edit button */}
      <td className="py-3 pr-4 w-14">
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/hours/edit?week=${week.weekStart}`)}
            aria-label={`Edit week ${week.weekStart}`}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
});
