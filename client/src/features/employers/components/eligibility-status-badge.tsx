import { Loader } from 'lucide-react';

import { cn } from '@/lib/utils';

export type EligibilityStatus = 'no-status' | 'checking' | 'eligible' | 'not-eligible';

interface EligibilityStatusBadgeProps {
  status: EligibilityStatus;
  className?: string;
}

export function EligibilityStatusBadge({
  status,
  className,
}: EligibilityStatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1',
        className,
      )}
    >
      {status === 'no-status' && (
        <>
          <div className="w-2 h-2 rounded-full bg-muted-foreground flex-shrink-0" />
          <span className="text-[11px] font-medium text-muted-foreground">
            No Status
          </span>
        </>
      )}

      {status === 'checking' && (
        <>
          <Loader className="w-2.5 h-2.5 text-muted-foreground animate-spin flex-shrink-0" />
          <span className="text-[11px] font-medium text-muted-foreground">
            Checking...
          </span>
        </>
      )}

      {status === 'eligible' && (
        <>
          <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
          <span className="text-[11px] font-medium text-success">Eligible</span>
        </>
      )}

      {status === 'not-eligible' && (
        <>
          <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
          <span className="text-[11px] font-medium text-danger">
            Not Eligible
          </span>
        </>
      )}
    </div>
  );
}

/** Derives EligibilityStatus from component state */
export function getEligibilityStatus(
  isChecking: boolean,
  isEligible: boolean | null,
): EligibilityStatus {
  if (isChecking) return 'checking';
  if (isEligible === null) return 'no-status';
  return isEligible ? 'eligible' : 'not-eligible';
}
