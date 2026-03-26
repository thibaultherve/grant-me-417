import { cn } from '@/lib/utils';
import { INDUSTRY_CONFIG } from '@/features/employers/components/industry-chip';
import type { IndustryType } from '@get-granted/shared';

import type { WeeklyEmployer } from '../../types/weekly';

interface EmployerHoursRowProps {
  employer: WeeklyEmployer;
  dates: string[];
  className?: string;
}

/**
 * Desktop employer row: small industry icon (12px) + employer name + eligibility dot + daily hours + total.
 * Matches design: minimal inline display, muted text, no full component badges.
 */
export function EmployerHoursRow({ employer, dates, className }: EmployerHoursRowProps) {
  return (
    <tr className={cn('border-0 hover:bg-transparent', className)}>
      {/* Employer info: icon + name + dot — with 3px left accent border + 16px padding */}
      <td className="py-2 px-4 border-l-[3px] border-l-primary">
        <div className="flex items-center gap-1 min-w-0">
          <IndustryIcon industry={employer.industry} />
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {employer.employerName}
          </span>
          <EligibilityDot isEligible={employer.isEligible} />
        </div>
      </td>

      {/* Daily hours (Mon-Sun) */}
      {dates.map((date) => (
        <td key={date} className="py-2 text-center">
          <span
            className={cn(
              'tabular-nums text-[11px] text-center',
              employer.dailyHours[date]
                ? 'font-normal text-muted-foreground'
                : 'text-border',
            )}
          >
            {employer.dailyHours[date] ? String(employer.dailyHours[date]) : '–'}
          </span>
        </td>
      ))}

      {/* Spacer for separator column */}
      <td className="w-4" />

      {/* Total */}
      <td className="py-2 text-right">
        <span className="tabular-nums text-[11px] font-semibold text-muted-foreground">
          {employer.totalHours > 0 ? `${employer.totalHours}h` : '–'}
        </span>
      </td>

      {/* Empty cells for Eligible + Days + Actions columns */}
      <td />
      <td />
      <td />
    </tr>
  );
}

/** Mobile variant of employer row */
export function EmployerHoursRowMobile({ employer, dates }: EmployerHoursRowProps) {
  return (
    <div className="flex flex-col gap-1 py-2">
      {/* Header: icon + name + dot | total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0">
          <IndustryIcon industry={employer.industry} />
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {employer.employerName}
          </span>
          <EligibilityDot isEligible={employer.isEligible} />
        </div>
        <span className="tabular-nums text-[11px] font-semibold text-muted-foreground shrink-0 ml-2">
          {employer.totalHours > 0 ? `${employer.totalHours}h` : '–'}
        </span>
      </div>

      {/* Daily hours grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {dates.map((date) => (
          <div key={date} className="text-center">
            <span
              className={cn(
                'tabular-nums text-[11px]',
                employer.dailyHours[date]
                  ? 'font-normal text-muted-foreground'
                  : 'text-border',
              )}
            >
              {employer.dailyHours[date] ? String(employer.dailyHours[date]) : '–'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Small 12px industry icon square */
function IndustryIcon({ industry }: { industry: string }) {
  const config = INDUSTRY_CONFIG[industry as IndustryType];
  if (!config) return null;

  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center shrink-0 rounded-sm',
        config.iconBg,
      )}
      style={{ width: 12, height: 12 }}
    >
      <Icon className="text-white" style={{ width: 7, height: 7 }} />
    </span>
  );
}

/** Small 4px eligibility dot — green (eligible) or red (not eligible) */
function EligibilityDot({ isEligible }: { isEligible: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full',
        isEligible ? 'bg-emerald-500' : 'bg-red-500',
      )}
      style={{ width: 4, height: 4 }}
    />
  );
}
