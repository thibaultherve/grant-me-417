/**
 * Auto-Distribute Toggle Component
 *
 * A switch toggle with a total hours input for auto-distributing hours across selected days.
 * When enabled, the total hours are evenly distributed across the selected days.
 * Shows max hours limit and warns when approaching capacity.
 *
 * Design: Toggle switch "Auto" (mobile) / "Auto-distribute" (desktop)
 * with inline Total input and Max hint.
 */

import { AlertCircle } from 'lucide-react';
import { useId } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface AutoDistributeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  total: {
    hours: string;
    onChange: (value: string) => void;
    error?: string;
    max: number;
  };
  selectedDaysCount: number;
  disabled?: boolean;
  className?: string;
}

export function AutoDistributeToggle({
  enabled,
  onToggle,
  total,
  selectedDaysCount,
  disabled = false,
  className,
}: AutoDistributeToggleProps) {
  const id = useId();
  const switchId = `${id}-auto-distribute`;
  const totalId = `${id}-total-hours`;
  const errorId = `${id}-auto-distribute-error`;
  const hasError = Boolean(total.error);

  // Calculate hours per day dynamically
  const currentTotal = parseFloat(total.hours) || 0;

  // Check if approaching limit (>90% of max)
  const isApproachingLimit = currentTotal > total.max * 0.9 && !hasError;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-4',
        className,
      )}
    >
      {/* Row: Switch + label + (when enabled) Total input + Max hint */}
      <div className="flex flex-wrap items-center gap-3">
        <Switch
          id={switchId}
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled}
          aria-describedby={hasError ? errorId : undefined}
        />
        <Label
          htmlFor={switchId}
          className={cn(
            'text-sm font-medium cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          Auto-distribute
        </Label>

        {/* Total hours input - inline when enabled */}
        {enabled && (
          <>
            <span className="text-sm text-muted-foreground">Total:</span>
            <Input
              id={totalId}
              type="text"
              inputMode="decimal"
              value={total.hours}
              onChange={(e) => total.onChange(e.target.value)}
              disabled={disabled}
              placeholder="40"
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
              className={cn(
                'h-8 w-16 text-center text-sm',
                hasError && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            <span className="text-xs text-muted-foreground">
              <span className="sm:hidden">Max {total.max}h</span>
              <span className="hidden sm:inline">
                Max {total.max}h / {selectedDaysCount} day
                {selectedDaysCount !== 1 ? 's' : ''}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Warning when approaching limit */}
      {enabled && isApproachingLimit && (
        <div className="flex items-center gap-2 text-xs text-amber-600 pl-12">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>
            Approaching maximum hours limit ({currentTotal}h / {total.max}h)
          </span>
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <p id={errorId} className="text-xs text-destructive pl-12">
          {total.error}
        </p>
      )}
    </div>
  );
}
