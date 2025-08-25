import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { WorkEntriesTable } from '@/features/work-entries/components/work-entries-table';

export const WorkEntriesRoute = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Entries</h1>
          <p className="text-muted-foreground">
            Log and manage your daily work hours
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      <WorkEntriesTable />
    </div>
  );
};