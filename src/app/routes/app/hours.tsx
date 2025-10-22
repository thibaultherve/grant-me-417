import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CalendarClock } from 'lucide-react';

import { HoursTable } from '@/features/hours/components/hours-table';
import { AddHoursForm } from '@/features/hours/components/add-hours-form';
import { useHours } from '@/features/hours/hooks/use-hours';

export const HoursRoute = () => {
  const [isAddingHours, setIsAddingHours] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOptions, setSortOptions] = useState({
    field: 'work_date' as const,
    order: 'desc' as const,
  });
  const limit = 10;

  const { data, isLoading, error, refetch } = useHours({
    page: currentPage,
    limit,
    sort: sortOptions,
  });

  const handleAddHoursSuccess = async () => {
    setIsAddingHours(false);
    // Refresh the hours data to show the new entries
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hours</h1>
          <p className="text-muted-foreground">
            Log and manage your daily work hours
          </p>
        </div>
        <Button onClick={() => setIsAddingHours(true)}>
          <CalendarClock className="mr-2 h-4 w-4" />
          Log Hours
        </Button>
      </div>

      <HoursTable 
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