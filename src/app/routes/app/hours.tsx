import { CalendarClock, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/info-card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useHours } from '@/features/hours/api/use-hours';
import { AddHoursForm } from '@/features/hours/components/add-hours-form';
import { ModernHoursTable } from '@/features/hours/components/modern-hours-table';
import type { SortOptions } from '@/features/hours/types';

export const HoursRoute = () => {
  const [isAddingHours, setIsAddingHours] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'work_date',
    order: 'desc',
  });
  const limit = 10;

  const { data, isLoading, error } = useHours({
    page: currentPage,
    limit,
    sort: sortOptions,
  });

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
        <Button onClick={() => setIsAddingHours(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Log Hours
        </Button>
      </div>

      {/* Info tip */}
      {data && data.data && data.data.length === 0 && !isLoading && (
        <InfoCard variant="accent">
          <div className="flex items-start gap-4">
            <CalendarClock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">
                Start tracking your work hours
              </h3>
              <p className="text-sm text-muted-foreground">
                Log your daily specified work hours to track progress toward
                your visa requirements. Each entry counts toward your 88 or 179
                day goal.
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

      <Sheet open={isAddingHours} onOpenChange={setIsAddingHours}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-4xl overflow-y-auto p-6"
        >
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
