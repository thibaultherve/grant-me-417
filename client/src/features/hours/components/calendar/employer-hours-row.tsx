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
      {/* Employer info: icon + name + dot — with left accent border */}
      <td className="py-1 px-4 border-l-[3px] border-l-primary">
        <div className="flex items-center gap-1 min-w-0">
          <IndustryIcon industry={employer.industry} />
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {employer.employerName}
          </span>
          <EligibilityDot isEligible={employer.isEligible} />
        </div>
      </td>

      {/* Empty Visa column cell */}
      <td />

      {/* Daily hours (Mon-Sun) */}
      {dates.map((date) => (
        <td key={date} className="py-1 text-center">
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
      <td className="py-1 text-right">
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
