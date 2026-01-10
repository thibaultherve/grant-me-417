/**
 * Auto-Distribute Toggle Component
 *
 * A checkbox with a total hours input for auto-distributing hours across selected days.
 * When enabled, the total hours are evenly distributed across the selected days.
 * Shows max hours limit and warns when approaching capacity.
 *
 * @example
 * ```tsx
 * <AutoDistributeToggle
 *   enabled={autoDistribute}
 *   onToggle={(checked) => setAutoDistribute(checked)}
 *   totalHours="40"
 *   onTotalChange={(value) => setTotalHours(value)}
 *   totalError="Max 120h for 5 days"
 *   selectedDaysCount={5}
 *   maxTotalHours={120}
 * />
 * ```
 */

import { AlertCircle } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AutoDistributeToggleProps {
  /** Whether auto-distribute mode is enabled */
  enabled: boolean;
  /** Callback when the checkbox is toggled */
  onToggle: (enabled: boolean) => void;
  /** Total hours value (string to preserve user input format) */
  totalHours: string;
  /** Callback when total hours value changes */
  onTotalChange: (value: string) => void;
  /** Validation error message for total hours */
  totalError?: string;
  /** Number of selected days for distribution */
  selectedDaysCount: number;
  /** Maximum total hours allowed (24 × selectedDaysCount) */
  maxTotalHours: number;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function AutoDistributeToggle({
  enabled,
  onToggle,
  totalHours,
  onTotalChange,
  totalError,
  selectedDaysCount,
  maxTotalHours,
  disabled = false,
  className,
}: AutoDistributeToggleProps) {
  const hasError = Boolean(totalError);

  // Calculate hours per day dynamically
  const currentTotal = parseFloat(totalHours) || 0;

  // Check if approaching limit (>90% of max)
  const isApproachingLimit = currentTotal > maxTotalHours * 0.9 && !hasError;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-4',
        className,
      )}
    >
      {/* Checkbox with label */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="auto-distribute"
          checked={enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
          disabled={disabled}
          aria-describedby={hasError ? 'auto-distribute-error' : undefined}
        />
        <Label
          htmlFor="auto-distribute"
          className={cn(
            'text-sm font-medium cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          Auto-distribute to selected days
        </Label>
      </div>

      {/* Total hours input - only shown when enabled */}
      {enabled && (
        <div className="flex flex-col gap-2 pl-7">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="total-hours"
              className="text-sm text-muted-foreground"
            >
              Total hours:
            </Label>
            <Input
              id="total-hours"
              type="text"
              inputMode="decimal"
              value={totalHours}
              onChange={(e) => onTotalChange(e.target.value)}
              disabled={disabled}
              placeholder="40"
              aria-invalid={hasError}
              aria-describedby={hasError ? 'auto-distribute-error' : undefined}
              className={cn(
                'h-8 w-20 text-center text-sm',
                hasError && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            <span className="text-xs text-muted-foreground">
              Max {maxTotalHours}h for {selectedDaysCount} selected day
              {selectedDaysCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Max hours info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground"></div>

          {/* Warning when approaching limit */}
          {isApproachingLimit && (
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>
                Approaching maximum hours limit ({currentTotal}h /{' '}
                {maxTotalHours}h)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <p id="auto-distribute-error" className="text-xs text-destructive pl-7">
          {totalError}
        </p>
      )}
    </div>
  );
}
