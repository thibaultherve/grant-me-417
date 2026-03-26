/**
 * Week Hours Form Component
 *
 * Main form container for the unified week-based hours entry system.
 * Composes WeekNavigator, WeekHoursGrid, and AutoDistributeToggle into
 * a complete form experience with week navigation, daily hours entry,
 * and save/cancel actions.
 *
 * @example
 * ```tsx
 * <WeekHoursForm
 *   employerId="abc-123"
 *   employerName="ABC Pty Ltd"
 *   onSuccess={() => console.log('Hours saved')}
 *   onCancel={() => console.log('Cancelled')}
 * />
 * ```
 */

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useWeekFormState } from '../../hooks/use-week-form-state';
import { AutoDistributeToggle } from '../inputs/auto-distribute-toggle';
import { WeekHoursGrid } from '../inputs/week-hours-grid';
import { WeekNavigator } from '../ui/week-navigator';

interface WeekHoursFormProps {
  /** Employer ID to manage hours for */
  employerId: string;
  /** Employer name to display in the grid */
  employerName: string;
  /** Callback when hours are successfully saved */
  onSuccess?: () => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Initial week to pre-select */
  initialWeek?: Date;
  /** Additional CSS classes */
  className?: string;
}

export function WeekHoursForm({
  employerId,
  employerName,
  onSuccess,
  onCancel,
  initialWeek,
  className,
}: WeekHoursFormProps) {
  // Initialize form state hook
  const {
    state,
    actions,
    computedTotal,
    canSubmit,
    dayColumns,
    weekRange,
    canGoPrevWeek,
    canGoNextWeek,
    goPrevWeek,
    goNextWeek,
    submit,
    selectedDaysCount,
    isDirty,
    maxTotalHours,
    datesWithHours,
  } = useWeekFormState(employerId, initialWeek);

  /**
   * Handle form submission
   * Calls the submit action and shows appropriate toast feedback
   */
  const handleSubmit = async () => {
    if (!canSubmit) return;

    const success = await submit();

    if (success) {
      toast.success(`Hours saved for ${weekRange}`);
      onSuccess?.();
    } else {
      toast.error('Failed to save hours. Please try again.');
    }
  };

  /**
   * Handle cancel action
   * Resets form state and calls the onCancel callback
   */
  const handleCancel = () => {
    actions.reset();
    onCancel?.();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Week Navigation with Calendar Picker */}
      <WeekNavigator
        weekRange={weekRange}
        currentWeek={state.currentWeek}
        onPrevWeek={goPrevWeek}
        onNextWeek={goNextWeek}
        onSelectWeek={actions.setWeek}
        canGoPrev={canGoPrevWeek}
        canGoNext={canGoNextWeek}
        highlightedDates={datesWithHours}
      />

      {/* Hours Entry Grid with Day Selection and Reset */}
      <WeekHoursGrid
        employerName={employerName}
        dayColumns={dayColumns}
        dailyHours={state.dailyHours}
        onDayChange={actions.setDayHours}
        errors={state.errors}
        computedTotal={computedTotal}
        selectedDays={state.selectedDays}
        onDaySelectedChange={actions.setDaySelected}
        onReset={actions.resetToInitial}
        isDirty={isDirty}
        disabled={state.isSubmitting}
        showDaySelection={state.autoDistribute}
      />

      {/* Auto-Distribute Toggle with Max Hours Info */}
      <AutoDistributeToggle
        enabled={state.autoDistribute}
        onToggle={actions.setAutoDistribute}
        totalHours={state.totalHours}
        onTotalChange={actions.setTotalHours}
        totalError={state.errors.total}
        selectedDaysCount={selectedDaysCount}
        maxTotalHours={maxTotalHours}
        disabled={state.isSubmitting}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={state.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || state.isSubmitting}
        >
          {state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Hours'
          )}
        </Button>
      </div>
    </div>
  );
}
