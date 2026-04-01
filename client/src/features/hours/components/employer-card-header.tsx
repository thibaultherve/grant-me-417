import type { IndustryType } from '@regranted/shared';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo } from 'react';

import {
  EligibilityStatusBadge,
  getEligibilityStatus,
} from '@/components/shared/eligibility-status-badge';
import { INDUSTRY_CONFIG } from '@/components/shared/industry-chip';
import { cn } from '@/lib/utils';

interface EmployerCardHeaderProps {
  employerName: string;
  industry: IndustryType;
  isEligible: boolean;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const EmployerCardHeader = memo(function EmployerCardHeader({
  employerName,
  industry,
  isEligible,
  total,
  isExpanded,
  onToggle,
}: EmployerCardHeaderProps) {
  const config = INDUSTRY_CONFIG[industry];
  const Icon = config.icon;
  const Chevron = isExpanded ? ChevronUp : ChevronDown;
  const eligibilityStatus = getEligibilityStatus(false, isEligible);

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left"
      aria-expanded={isExpanded}
    >
      {/* Industry icon */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          config.iconBg,
        )}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>

      {/* Name + badge */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-semibold text-foreground">
          {employerName}
        </span>
        <EligibilityStatusBadge status={eligibilityStatus} />
      </div>

      {/* Total hours */}
      <span
        className={cn(
          'shrink-0 text-sm font-semibold',
          isExpanded && total > 0 ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {total}h
      </span>

      {/* Chevron */}
      <Chevron className="h-5 w-5 shrink-0 text-muted-foreground" />
    </button>
  );
});
