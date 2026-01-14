import { Building2, Plus } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoCard } from '@/components/ui/info-card';
import { paths } from '@/config/paths';
import {
  useDeleteEmployer,
  useEmployers,
} from '@/features/employers/api/use-employers';
import { EmployersList } from '@/features/employers/components/employers-list';

export const EmployersRoute = () => {
  // React Query hooks
  const { data: employers = [], isLoading: loading, error } = useEmployers();
  const deleteMutation = useDeleteEmployer();

  const handleDeleteEmployer = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold mb-1">Manage your employers</h3>
              <p className="text-sm text-muted-foreground">
                Manage your employers and work locations
              </p>
            </div>
            <Button asChild size="lg">
              <Link to={paths.app.employers.new.getHref()}>
                <Plus className="mr-2 h-4 w-4" />
                New Employer
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info tip */}
      {employers.length === 0 && !loading && (
        <InfoCard variant="accent">
          <div className="flex items-start gap-4">
            <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Add your first employer</h3>
              <p className="text-sm text-muted-foreground">
                Track where you've worked during your Working Holiday Visa. Add
                employer details to organize your work hours.
              </p>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Pass all state and handlers as props - Lift State Up pattern */}
      <EmployersList
        employers={employers}
        loading={loading}
        error={error}
        onDelete={handleDeleteEmployer}
      />
    </div>
  );
};
