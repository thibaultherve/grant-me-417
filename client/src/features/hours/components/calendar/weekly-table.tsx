import { cn } from '@/lib/utils';

import type { WeekData, VisaPeriod } from '../../types/weekly';
import { WeekSummaryRow } from './week-summary-row';
import { EmployerHoursRow } from './employer-hours-row';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface WeeklyTableProps {
  weeks: WeekData[];
  visas: VisaPeriod[];
  isExpanded: (weekStart: string) => boolean;
  toggleWeek: (weekStart: string) => void;
  year: number;
  month: number;
}

/**
 * Desktop weekly hours table. Semantic <table> with:
 * - Column headers: Week | Mon-Sun | separator | Total | Eligible | Days | Actions
 * - Week rows: summary (collapsed) + employer breakdown (expanded)
 * - Custom expand state (no Radix Accordion — invalid inside <table>)
 */
const today = new Date().toISOString().slice(0, 10);

export function WeeklyTable({
  weeks,
  visas,
  isExpanded,
  toggleWeek,
  year,
  month,
}: WeeklyTableProps) {
  return (
    <div className="rounded-[10px] border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        {/* Column headers */}
        <thead>
          <tr className="bg-muted border-b">
            <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground w-[90px]">
              Week
            </th>
            <th className="py-3 text-center text-[11px] font-semibold text-muted-foreground w-10">
              Visa
            </th>
            <th className="py-3 text-center text-[11px] font-semibold text-muted-foreground w-[70px]">
              Total Hours
            </th>
            <th className="py-3 text-center text-[11px] font-semibold text-muted-foreground w-[75px]">
              Eligible Hours
            </th>
            <th className="py-3 text-center text-[11px] font-semibold text-foreground w-[75px]">
              Eligible Days
            </th>
            {/* Separator */}
            <th className="w-4">
              <div className="h-3.5 w-px bg-border mx-auto" />
            </th>
            {DAY_HEADERS.map((day) => (
              <th
                key={day}
                className="py-3 text-center text-[11px] font-semibold text-muted-foreground"
              >
                {day}
              </th>
            ))}
            <th className="py-3 pr-4 w-14" />
          </tr>
        </thead>

        <tbody>
          {weeks.filter((w) => w.weekStart <= today).map((week, idx, arr) => {
            const expanded = isExpanded(week.weekStart);

            return (
              <WeekGroup
                key={week.weekStart}
                week={week}
                visas={visas}
                isExpanded={expanded}
                onToggle={() => toggleWeek(week.weekStart)}
                year={year}
                month={month}
                isLast={idx === arr.length - 1}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface WeekGroupProps {
  week: WeekData;
  visas: VisaPeriod[];
  isExpanded: boolean;
  onToggle: () => void;
  year: number;
  month: number;
  isLast: boolean;
}

function WeekGroup({
  week,
  visas,
  isExpanded,
  onToggle,
  year,
  month,
  isLast,
}: WeekGroupProps) {
  return (
    <>
      {/* Summary + visa strip rows */}
      <WeekSummaryRow
        week={week}
        visas={visas}
        isExpanded={isExpanded}
        onToggle={onToggle}
        year={year}
        month={month}
      />

      {/* Employer breakdown (visible when expanded) */}
      {isExpanded && week.employers.length > 0 && (
        <>
          {week.employers.map((employer, i) => (
            <EmployerHoursRow
              key={employer.employerId}
              employer={employer}
              dates={week.dates}
              className="bg-[#F8F6FF]"
              isFirst={i === 0}
              isLast={i === week.employers.length - 1}
            />
          ))}
        </>
      )}

      {/* Divider between weeks */}
      {!isLast && (
        <tr className={cn('border-0', isExpanded && 'bg-[#F8F6FF]')}>
          <td colSpan={14} className={cn(
            'p-0 border-l-[3px]',
            isExpanded ? 'border-l-primary' : 'border-l-transparent',
          )}>
            <div className="h-px bg-border" />
          </td>
        </tr>
      )}
    </>
  );
}
