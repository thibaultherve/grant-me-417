import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { InfoCard } from '@/components/ui/info-card';
import { CalendarClock, Plus } from 'lucide-react';

import { HoursStatistics } from '@/features/hours/components/hours-statistics';
import { ModernHoursTable } from '@/features/hours/components/modern-hours-table';
import { AddHoursForm } from '@/features/hours/components/add-hours-form';
import { useHours } from '@/features/hours/api/use-hours';
import type { SortOptions } from '@/features/hours/types';

export const HoursRoute = () => {
  const [isAddingHours, setIsAddingHours] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'work_date',
    order: 'desc',
  });
  const limit = 10;

  const { data, isLoading, error, refetch } = useHours({
    page: currentPage,
    limit,
    sort: sortOptions,
  });

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!data?.entries) {
      return { totalHours: 0, daysWorked: 0, eligibleDays: 0 };
    }

    const totalHours = data.entries.reduce((sum, entry) => sum + entry.hours, 0);
    const daysWorked = new Set(data.entries.map(entry => entry.work_date)).size;
    const eligibleDays = data.entries.filter(entry => entry.is_eligible).length;

    return { totalHours, daysWorked, eligibleDays };
  }, [data?.entries]);

  const handleAddHoursSuccess = () => {
    setIsAddingHours(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Hours</h1>
          <p className="mt-1 text-muted-foreground">
            Track your specified work hours for visa eligibility
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <HoursStatistics
        totalHours={statistics.totalHours}
        daysWorked={statistics.daysWorked}
        eligibleDays={statistics.eligibleDays}
        isLoading={isLoading}
      />

      {/* Info tip */}
      {data && data.entries && data.entries.length === 0 && !isLoading && (
        <InfoCard variant="accent">
          <div className="flex items-start gap-4">
            <CalendarClock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Start tracking your work hours</h3>
              <p className="text-sm text-muted-foreground">
                Log your daily specified work hours to track progress toward your visa requirements.
                Each entry counts toward your 88 or 179 day goal.
              </p>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Modern Table */}
      <ModernHoursTable
        data={data}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sortOptions={sortOptions}
        setSortOptions={setSortOptions}
        limit={limit}
      />

      {/* Floating Action Button + Sheet */}
      <Button
        size="lg"
        onClick={() => setIsAddingHours(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:h-auto md:w-auto md:rounded-md md:px-6 z-50"
      >
        <Plus className="h-6 w-6 md:mr-2" />
        <span className="hidden md:inline">Log Hours</span>
      </Button>

      <Sheet open={isAddingHours} onOpenChange={setIsAddingHours}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-6">
          <SheetHeader className="mb-3">
            <SheetTitle>Log Work Hours</SheetTitle>
          </SheetHeader>
          <AddHoursForm
            onSuccess={handleAddHoursSuccess}
            onCancel={() => setIsAddingHours(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};