import { cn } from '@/lib/utils';
import { INDUSTRY_CONFIG } from '@/components/shared/industry-chip';
import type { IndustryType } from '@regranted/shared';

import type { WeeklyEmployer } from '../../types/weekly';

interface EmployerHoursRowProps {
  employer: WeeklyEmployer;
  dates: string[];
  className?: string;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * Desktop employer row: small industry icon (12px) + employer name + eligibility dot + daily hours + total.
 * Matches design: minimal inline display, muted text, no full component badges.
 */
export function EmployerHoursRow({ employer, dates, className, isFirst, isLast }: EmployerHoursRowProps) {
  // Design padding: container [4,16,10,16] + row [4,0]
  // First row top: 4 (container) + 4 (row) = 8px, last row bottom: 4 (row) + 10 (container) = 14px
  const vPad = cn(
    isFirst ? 'pt-2' : 'pt-1',
    isLast ? 'pb-3.5' : 'pb-1',
  );

  return (
    <tr className={cn('border-0 hover:bg-transparent', className)}>
      {/* Employer info: icon + name + dot — with left accent border */}
      <td className={cn(vPad, 'px-4 border-l-[3px] border-l-primary')}>
        <div className="flex items-center gap-1.5 min-w-0">
          <IndustryIcon industry={employer.industry} />
          <span className="text-xs font-medium text-muted-foreground truncate">
            {employer.employerName}
          </span>
          <EligibilityDot isEligible={employer.isEligible} />
        </div>
      </td>

      {/* Empty Visa column cell */}
      <td />

      {/* Total */}
      <td className={cn(vPad, 'text-center')}>
        <span className="tabular-nums text-xs font-semibold text-muted-foreground">
          {employer.totalHours > 0 ? `${employer.totalHours}h` : '–'}
        </span>
      </td>

      {/* Empty cells for Eligible Hours + Eligible Days */}
      <td />
      <td />

      {/* Spacer for separator column */}
      <td className="w-4" />

      {/* Daily hours (Mon-Sun) */}
      {dates.map((date) => (
        <td key={date} className={cn(vPad, 'text-center')}>
          <span
            className={cn(
              'tabular-nums text-xs text-center',
              employer.dailyHours[date]
                ? 'font-normal text-muted-foreground'
                : 'text-border',
            )}
          >
            {employer.dailyHours[date] ? String(employer.dailyHours[date]) : '–'}
          </span>
        </td>
      ))}

      {/* Empty cell for Actions column */}
      <td />
    </tr>
  );
}

/** Mobile variant of employer row */
export function EmployerHoursRowMobile({ employer, dates }: EmployerHoursRowProps) {
  return (
    <div className="py-1">
      {/* Name + total | daily hours all on two tight lines */}
      <div className="flex items-center justify-between leading-none">
        <div className="flex items-center gap-0.5 min-w-0">
          <IndustryIcon industry={employer.industry} />
          <span className="text-[9px] font-medium text-muted-foreground truncate">
            {employer.employerName}
          </span>
          <EligibilityDot isEligible={employer.isEligible} />
        </div>
        <span className="tabular-nums text-[9px] font-semibold text-muted-foreground shrink-0">
          {employer.totalHours > 0 ? `${employer.totalHours}h` : '–'}
        </span>
      </div>
      <div className="grid grid-cols-7 leading-none mt-px">
        {dates.map((date) => (
          <span
            key={date}
            className={cn(
              'tabular-nums text-[9px] text-center',
              employer.dailyHours[date]
                ? 'text-muted-foreground'
                : 'text-muted-foreground/25',
            )}
          >
            {employer.dailyHours[date] ? String(employer.dailyHours[date]) : '–'}
          </span>
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
      style={{ width: 16, height: 16 }}
    >
      <Icon className="text-white" style={{ width: 9, height: 9 }} />
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
