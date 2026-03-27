import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import {
  useDeleteEmployer,
  useEmployers,
} from '@/features/employers/api/use-employers';
import { EmployersList } from '@/features/employers/components/employers-list';
import { usePageHeader } from '@/hooks/use-page-header';

export const EmployersRoute = () => {
  const { data: employers = [], isLoading: loading, error } = useEmployers();
  const deleteMutation = useDeleteEmployer();

  usePageHeader({
    description: 'Manage your work experience employers',
    action: () => (
      <Button asChild size="lg" className="w-full md:w-auto">
        <Link to={paths.app.employers.new.getHref()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employer
        </Link>
      </Button>
    ),
  });

  const handleDeleteEmployer = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
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
