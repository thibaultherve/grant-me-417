import { memo } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Pencil } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import type { WeekData, VisaPeriod } from '../../types/weekly';
import { VisaValues } from './week-totals';
import { EmployerHoursRowMobile } from './employer-hours-row';
import {
  formatWeekLabel,
  buildDayBars,
  getWeekVisaInfo,
  getVisaBarColor,
  isInMonth,
  VISA_TEXT_COLORS,
  VISA_BADGE_BG,
} from '../../utils/weekly-helpers';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

interface WeekCardProps {
  week: WeekData;
  visas: VisaPeriod[];
  isExpanded: boolean;
  onToggle: () => void;
  year: number;
  month: number;
}

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
  const { visaTypes, showPerDayDots } = getWeekVisaInfo(week.dates, visas);

  return (
    <div
      className={cn(
        'rounded-lg border shadow-sm overflow-hidden border-l-[3px] transition-colors',
        isExpanded
          ? 'bg-[#F8F6FF] border-l-primary'
          : hasData
            ? 'bg-card border-l-transparent active:bg-[#F8F6FF]/50'
            : 'bg-card border-l-transparent',
        hasData && 'cursor-pointer',
      )}
      onClick={hasData ? onToggle : undefined}
    >
      {/* Header: week label + visa dots | Total · Eligible · Days | edit */}
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
            !hasData && 'invisible',
            isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground',
          )}
        />
        <span className={cn(
          'text-[13px] text-foreground whitespace-nowrap',
          isExpanded ? 'font-semibold' : 'font-medium',
        )}>
          {formatWeekLabel(week.weekStart, week.weekEnd)}
        </span>
        {visaTypes.length > 0 && (
          <span className="flex items-center gap-0.5">
            {visaTypes.map((vt) => (
              <span
                key={vt}
                className={cn('h-[5px] w-[5px] rounded-full', getVisaBarColor(vt))}
              />
            ))}
          </span>
        )}

        {/* Right side: labeled stats + edit */}
        <span className="ml-auto flex items-center gap-5">
          {hasData ? (
            <>
              <StatChip label="Total Hours" value={`${week.totalHours}h`} />
              <StatChip label="Eligible Hours">
                <VisaValues
                  breakdown={week.visaBreakdown}
                  getValue={(vb) => `${vb.eligibleHours}h`}
                  getNumber={(vb) => vb.eligibleHours}
                  size="mobile"
                  showDots={showPerDayDots}
                />
              </StatChip>
              <StatChip label="Eligible Days" bold>
                <VisaValues
                  breakdown={week.visaBreakdown}
                  getValue={(vb) => `${vb.eligibleDays}d`}
                  getNumber={(vb) => vb.eligibleDays}
                  size="mobile"
                  showDots={showPerDayDots}
                  bold
                />
              </StatChip>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground/40">No hours logged</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={(e) => { e.stopPropagation(); navigate(`/app/hours/edit?week=${week.weekStart}`); }}
            aria-label={`Edit week ${week.weekStart}`}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </span>
      </div>

      {/* Expanded: daily hours + employer breakdown */}
      {isExpanded && hasData && (
        <>
          {/* Daily hours grid */}
          <div className="px-2.5 py-1">
            <div className="flex">
              {week.dates.map((date, i) => (
                <div
                  key={date}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-px',
                    !isInMonth(date, year, month) && 'opacity-40',
                  )}
                >
                  <span className="text-[9px] font-medium text-muted-foreground/70">
                    {DAY_LABELS[i]}
                  </span>
                  <span className="relative inline-flex justify-center">
                    <span className={cn(
                      'tabular-nums text-[11px]',
                      week.dailyTotals[date] ? 'font-semibold text-foreground' : 'text-muted-foreground/40',
                    )}>
                      {week.dailyTotals[date] ? String(week.dailyTotals[date]) : '–'}
                    </span>
                    {dayBars[i].visaType && dayBars[i].boundary ? (
                      <span
                        className={cn(
                          'absolute left-1/2 -translate-x-1/2 -bottom-2 rounded-full px-1 py-px text-[7px] font-semibold leading-tight whitespace-nowrap',
                          VISA_BADGE_BG[dayBars[i].visaType!],
                          VISA_TEXT_COLORS[dayBars[i].visaType!],
                        )}
                      >
                        {dayBars[i].boundary}
                      </span>
                    ) : showPerDayDots && dayBars[i].visaType ? (
                      <span
                        className={cn(
                          'absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-1 w-1 rounded-full',
                          dayBars[i].color,
                        )}
                      />
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Employer breakdown */}
          {week.employers.length > 0 && (
            <div className="px-2.5 py-0.5">
              {week.employers.map((employer) => (
                <EmployerHoursRowMobile
                  key={employer.employerId}
                  employer={employer}
                  dates={week.dates}
                />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
});

/** Tiny labeled stat for the mobile header */
function StatChip({
  label,
  value,
  bold,
  children,
}: {
  label: string;
  value?: string;
  bold?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <span className="flex flex-col items-center">
      <span className="text-[8px] leading-none text-muted-foreground/50 uppercase tracking-wider">
        {label}
      </span>
      {value ? (
        <span className={cn(
          'tabular-nums text-[12px] leading-tight',
          bold ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground',
        )}>
          {value}
        </span>
      ) : (
        <span className="flex items-center gap-0.5 leading-tight text-[12px]">
          {children}
        </span>
      )}
    </span>
  );
}
