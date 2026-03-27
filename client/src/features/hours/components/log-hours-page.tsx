import { addDays, subDays } from 'date-fns';
import { Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import type { IndustryType } from '@regranted/shared';

import { useExpansionState } from '../hooks/use-expansion-state';
import { useLogHoursState } from '../hooks/use-log-hours-state';
import { getMondayOfWeek } from '../utils/date-helpers';
import { isWeekStarted } from '../utils/week-validation';
import { EmployerHoursCard } from './employer-hours-card';
import { WeekNavigator } from './ui/week-navigator';
import { UnsavedChangesDialog } from './unsaved-changes-dialog';
import { WeekSummary } from './week-summary';

interface LogHoursPageProps {
  initialWeek?: Date;
}

export function LogHoursPage({ initialWeek }: LogHoursPageProps) {
  // ── Week navigation state ──
  const [currentWeek, setCurrentWeek] = useState(
    () => initialWeek ?? getMondayOfWeek(new Date()),
  );
  const [pendingWeek, setPendingWeek] = useState<Date | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // ── Core hooks ──
  const logHours = useLogHoursState(currentWeek);

  // Build employer metadata lookup from server data
  const employerMeta = useMemo(() => {
    const meta: Record<
      string,
      { name: string; industry: IndustryType; isEligible: boolean }
    > = {};
    if (logHours.serverData) {
      for (const emp of logHours.serverData.employers) {
        meta[emp.employerId] = {
          name: emp.employerName,
          industry: emp.industry as IndustryType,
          isEligible: emp.isEligible,
        };
      }
    }
    return meta;
  }, [logHours.serverData]);

  // Employer IDs sorted by saved total desc, then createdAt desc (server order) for ties
  // Uses server totals so order only changes after save, not during editing
  const employerIds = useMemo(() => {
    if (!logHours.serverData) return [];
    const employers = logHours.serverData.employers;
    return [...employers]
      .sort((a, b) => b.total - a.total)
      .map((e) => e.employerId);
  }, [logHours.serverData]);

  const expansion = useExpansionState(employerIds);

  // ── Week navigation ──
  const nextWeekMonday = useMemo(() => addDays(currentWeek, 7), [currentWeek]);
  const canGoNext = useMemo(
    () => isWeekStarted(nextWeekMonday),
    [nextWeekMonday],
  );

  const navigateToWeek = useCallback(
    (week: Date) => {
      const monday = getMondayOfWeek(week);
      if (logHours.isDirty) {
        setPendingWeek(monday);
        setShowUnsavedDialog(true);
      } else {
        setCurrentWeek(monday);
      }
    },
    [logHours.isDirty],
  );

  const goPrev = useCallback(
    () => navigateToWeek(subDays(currentWeek, 7)),
    [currentWeek, navigateToWeek],
  );
  const goNext = useCallback(
    () => navigateToWeek(addDays(currentWeek, 7)),
    [currentWeek, navigateToWeek],
  );

  // ── Save ──
  const handleSave = useCallback(async () => {
    const ok = await logHours.submit();
    if (ok) {
      toast.success('Hours saved');
    } else {
      toast.error('Failed to save hours');
    }
  }, [logHours]);

  // ── Unsaved changes dialog actions ──
  const handleSaveAndContinue = useCallback(async () => {
    const ok = await logHours.submit();
    if (ok) {
      toast.success('Hours saved');
      if (pendingWeek) setCurrentWeek(pendingWeek);
    } else {
      toast.error('Failed to save hours');
    }
    setPendingWeek(null);
    setShowUnsavedDialog(false);
  }, [logHours, pendingWeek]);

  const handleDiscard = useCallback(() => {
    logHours.actions.resetAll();
    if (pendingWeek) setCurrentWeek(pendingWeek);
    setPendingWeek(null);
    setShowUnsavedDialog(false);
  }, [logHours.actions, pendingWeek]);

  const handleCancelDialog = useCallback(() => {
    setPendingWeek(null);
    setShowUnsavedDialog(false);
  }, []);

  // ── Empty state ──
  if (employerIds.length === 0 && !logHours.isSubmitting) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t added any employers yet
          </p>
          <Button asChild>
            <Link to={paths.app.employers.new.getHref()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employer
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Week Navigator ── */}
      <WeekNavigator
        weekRange={logHours.weekRange}
        compactWeekRange={logHours.compactWeekRange}
        currentWeek={currentWeek}
        onPrevWeek={goPrev}
        onNextWeek={goNext}
        onSelectWeek={navigateToWeek}
        canGoPrev={true}
        canGoNext={canGoNext}
      />

      {/* ── Week Summary ── */}
      <WeekSummary
        weekTotal={logHours.weekTotal}
        employerCount={
          Object.values(logHours.employerTotals).filter((t) => t > 0).length
        }
      />

      {/* ── Employer Cards ── */}
      <div className="space-y-2">
        {employerIds.map((employerId) => {
          const empState = logHours.state.employers[employerId];
          if (!empState) return null;

          const meta = employerMeta[employerId];

          return (
            <EmployerHoursCard
              key={employerId}
              employerId={employerId}
              employerName={meta?.name ?? ''}
              industry={(meta?.industry ?? 'other') as IndustryType}
              isEligible={meta?.isEligible ?? false}
              total={logHours.employerTotals[employerId] ?? 0}
              isExpanded={expansion.isExpanded(employerId)}
              onToggleExpanded={() => expansion.toggle(employerId)}
              employerState={empState}
              actions={logHours.actions}
              dayColumns={logHours.dayColumns}
              fieldErrors={logHours.employerErrors[employerId]}
              crossEmployerErrors={logHours.crossEmployerErrors}
              isSubmitting={logHours.isSubmitting}
            />
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" asChild>
          <Link to={paths.app.hours.getHref()}>Cancel</Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={!logHours.canSubmit}
          size="lg"
        >
          {logHours.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save
        </Button>
      </div>

      {/* ── Unsaved Changes Dialog ── */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onSaveAndContinue={handleSaveAndContinue}
        onDiscard={handleDiscard}
        onCancel={handleCancelDialog}
        isSaving={logHours.isSubmitting}
      />
    </div>
  );
}
