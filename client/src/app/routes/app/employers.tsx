import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import {
  useDeleteEmployer,
  useEmployers,
} from '@/features/employers/api/use-employers';
import { EmployersList } from '@/features/employers/components/employers-list';

export const EmployersRoute = () => {
  const { data: employers = [], isLoading: loading, error } = useEmployers();
  const deleteMutation = useDeleteEmployer();

  const handleDeleteEmployer = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">Employers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your work experience employers
          </p>
        </div>
        <Button asChild size="lg">
          <Link to={paths.app.employers.new.getHref()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employer
          </Link>
        </Button>
      </div>

      {/* Summary Bar */}
      {!loading && employers.length > 0 && (
        <p className="text-[13px] font-medium text-muted-foreground">
          {employers.length} employer{employers.length !== 1 ? 's' : ''}
        </p>
      )}

      <EmployersList
        employers={employers}
        loading={loading}
        error={error}
        onDelete={handleDeleteEmployer}
      />
    </div>
  );
};
