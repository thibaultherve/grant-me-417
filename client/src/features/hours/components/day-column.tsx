import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { DayColumn as DayColumnType } from '../types/log-hours';

interface DayColumnProps {
  column: DayColumnType;
  value: string;
  isSelected: boolean;
  showCheckbox: boolean;
  onChange: (value: string) => void;
  onToggleSelected: () => void;
  error?: string;
  crossEmployerError?: string;
  disabled?: boolean;
  /** Unique prefix for IDs (e.g., employerId) */
  idPrefix: string;
}

export function DayColumn({
  column,
  value,
  isSelected,
  showCheckbox,
  onChange,
  onToggleSelected,
  error,
  crossEmployerError,
  disabled = false,
  idPrefix,
}: DayColumnProps) {
  const inputId = `${idPrefix}-${column.dateKey}`;
  const hasError = Boolean(error || crossEmployerError);
  const isInputDisabled = disabled || (showCheckbox && !isSelected);

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
      {/* Checkbox (only when auto-distribute is ON) */}
      {showCheckbox && (
        <Checkbox
          id={`${inputId}-check`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelected()}
          disabled={disabled}
          className="h-4 w-4"
        />
      )}

      {/* Day label */}
      <label
        htmlFor={inputId}
        className="text-xs font-medium text-muted-foreground"
      >
        {column.dayName}
      </label>

      {/* Date */}
      <span className="text-[11px] text-muted-foreground">
        {column.dayNumber} {column.monthName}
      </span>

      {/* Hour input */}
      <Input
        id={inputId}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isInputDisabled}
        placeholder="0"
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={cn(
          'h-9 w-full text-center text-sm',
          isSelected && showCheckbox && 'border-primary bg-background',
          !isSelected && showCheckbox && 'border-border bg-muted',
          hasError && 'border-destructive focus-visible:ring-destructive',
        )}
      />

      {/* Cross-employer error */}
      {crossEmployerError && (
        <p
          id={`${inputId}-error`}
          className="text-[10px] text-destructive text-center leading-tight"
        >
          {crossEmployerError}
        </p>
      )}

      {/* Field error */}
      {error && !crossEmployerError && (
        <p
          id={`${inputId}-error`}
          className="text-[10px] text-destructive text-center leading-tight"
        >
          {error}
        </p>
      )}
    </div>
  );
}
