import { cn } from '@/lib/utils';

import type {
  CrossEmployerErrors,
  EmployerHoursState,
  EmployerMeta,
  LogHoursActions,
} from '../types/log-hours';
import type { DayColumn as DayColumnType } from '../types/log-hours';
import { MAX_HOURS_PER_DAY } from '../utils/week-calculations';
import { AutoDistributeToggle } from './inputs/auto-distribute-toggle';
import { DayGrid } from './day-grid';
import { EmployerCardHeader } from './employer-card-header';

interface EmployerHoursCardProps {
  employer: EmployerMeta;
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
  employer,
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
          <div className="w-1.25 shrink-0 rounded-l-xl bg-primary" />
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <EmployerCardHeader
            employerName={employer.name}
            industry={employer.industry}
            isEligible={employer.isEligible}
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
                employerId={employer.id}
                onDayHoursChange={(dateKey, value) =>
                  actions.setDayHours(employer.id, dateKey, value)
                }
                onToggleDaySelected={(dateKey) =>
                  actions.toggleDaySelected(employer.id, dateKey)
                }
                fieldErrors={fieldErrors}
                crossEmployerErrors={crossEmployerErrors}
                disabled={isSubmitting}
              />

              {/* Auto-Distribute Toggle */}
              <AutoDistributeToggle
                enabled={employerState.autoDistribute}
                onToggle={() => actions.toggleAutoDistribute(employer.id)}
                total={{
                  hours: employerState.totalHours,
                  onChange: (value) =>
                    actions.setTotalHours(employer.id, value),
                  max: maxTotalHours,
                }}
                selectedDaysCount={selectedDaysCount}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
