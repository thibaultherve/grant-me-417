import { cn } from '@/lib/utils';
import type { IndustryType } from '@regranted/shared';

import type {
  CrossEmployerErrors,
  EmployerHoursState,
  LogHoursActions,
} from '../types/log-hours';
import type { DayColumn as DayColumnType } from '../types/log-hours';
import { MAX_HOURS_PER_DAY } from '../utils/week-calculations';
import { AutoDistributeToggle } from './inputs/auto-distribute-toggle';
import { DayGrid } from './day-grid';
import { EmployerCardHeader } from './employer-card-header';

interface EmployerHoursCardProps {
  employerId: string;
  employerName: string;
  industry: IndustryType;
  isEligible: boolean;
  total: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  employerState: EmployerHoursState;
  actions: LogHoursActions;
  dayColumns: DayColumnType[];
  fieldErrors?: Record<string, string>;
  crossEmployerErrors: CrossEmployerErrors;
  isSubmitting: boolean;
}

export function EmployerHoursCard({
  employerId,
  employerName,
  industry,
  isEligible,
  total,
  isExpanded,
  onToggleExpanded,
  employerState,
  actions,
  dayColumns,
  fieldErrors,
  crossEmployerErrors,
  isSubmitting,
}: EmployerHoursCardProps) {
  const selectedDaysCount = Object.values(
    employerState.selectedDays,
  ).filter(Boolean).length;
  const maxTotalHours = selectedDaysCount * MAX_HOURS_PER_DAY;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border transition-colors',
        isExpanded
          ? 'bg-primary-light shadow-[0_2px_12px_var(--primary-shadow)]'
          : 'bg-card shadow-sm',
      )}
    >
      <div className="flex">
        {/* Purple accent strip (expanded only) */}
        {isExpanded && (
          <div className="w-[5px] shrink-0 rounded-l-xl bg-primary" />
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <EmployerCardHeader
            employerName={employerName}
            industry={industry}
            isEligible={isEligible}
            total={total}
            isExpanded={isExpanded}
            onToggle={onToggleExpanded}
          />

          {/* Expanded content */}
          {isExpanded && (
            <div className="space-y-4 px-4 pb-4">
              {/* Day Grid */}
              <DayGrid
                dayColumns={dayColumns}
                employerState={employerState}
                employerId={employerId}
                onDayHoursChange={(dateKey, value) =>
                  actions.setDayHours(employerId, dateKey, value)
                }
                onToggleDaySelected={(dateKey) =>
                  actions.toggleDaySelected(employerId, dateKey)
                }
                fieldErrors={fieldErrors}
                crossEmployerErrors={crossEmployerErrors}
                disabled={isSubmitting}
              />

              {/* Auto-Distribute Toggle */}
              <AutoDistributeToggle
                enabled={employerState.autoDistribute}
                onToggle={() => actions.toggleAutoDistribute(employerId)}
                totalHours={employerState.totalHours}
                onTotalChange={(value) =>
                  actions.setTotalHours(employerId, value)
                }
                selectedDaysCount={selectedDaysCount}
                maxTotalHours={maxTotalHours}
                disabled={isSubmitting}
                idPrefix={employerId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
