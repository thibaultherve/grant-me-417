import { cn } from '@/lib/utils';

import type { CrossEmployerErrors, EmployerHoursState } from '../types/log-hours';
import type { DayColumn as DayColumnType } from '../types/log-hours';
import { DayColumn } from './day-column';

interface DayGridProps {
  dayColumns: DayColumnType[];
  employerState: EmployerHoursState;
  employerId: string;
  onDayHoursChange: (dateKey: string, value: string) => void;
  onToggleDaySelected: (dateKey: string) => void;
  fieldErrors?: Record<string, string>;
  crossEmployerErrors: CrossEmployerErrors;
  disabled?: boolean;
  className?: string;
}

export function DayGrid({
  dayColumns,
  employerState,
  employerId,
  onDayHoursChange,
  onToggleDaySelected,
  fieldErrors = {},
  crossEmployerErrors,
  disabled = false,
  className,
}: DayGridProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {dayColumns.map((column) => (
        <DayColumn
          key={column.dateKey}
          column={column}
          value={employerState.hours[column.dateKey] ?? ''}
          isSelected={employerState.selectedDays[column.dateKey] ?? false}
          showCheckbox={employerState.autoDistribute}
          onChange={(value) => onDayHoursChange(column.dateKey, value)}
          onToggleSelected={() => onToggleDaySelected(column.dateKey)}
          error={fieldErrors[column.dateKey]}
          crossEmployerError={crossEmployerErrors[column.dateKey]}
          disabled={disabled}
          idPrefix={employerId}
        />
      ))}
    </div>
  );
}
