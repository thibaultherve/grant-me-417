import { Plane, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoCard } from '@/components/ui/info-card';
import { paths } from '@/config/paths';
import { useDeleteVisa } from '@/features/visas/api/use-visas';
import { VisasList } from '@/features/visas/components/visas-list';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';
import type { UserVisa } from '@/features/visas/types';
import { visaTypeToSlug } from '@/features/visas/utils/visa-helpers';

export const VisasRoute = () => {
  const navigate = useNavigate();

  // React Query hooks
  const { visas, isLoading, error } = useVisaContext();
  const deleteMutation = useDeleteVisa();

  const handleEditVisa = (visa: UserVisa) => {
    navigate(paths.app.visas.edit.getHref(visaTypeToSlug(visa.visa_type)));
  };

  const handleDeleteVisa = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold mb-1">Manage your visas</h3>
              <p className="text-sm text-muted-foreground">
                Manage your Working Holiday Visas (up to 3 visas)
              </p>
            </div>
            <Button asChild size="lg" disabled={visas.length >= 3}>
              <Link to={paths.app.visas.new.getHref()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Visa
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info tip */}
      {visas.length === 0 && !isLoading && (
        <InfoCard variant="accent">
          <div className="flex items-start gap-4">
            <Plane className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Create your first visa</h3>
              <p className="text-sm text-muted-foreground">
                Start by adding your current Working Holiday Visa (subclass
                417). You can track work progress for up to 3 visas.
              </p>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Pass all state and handlers as props - Lift State Up pattern */}
      <VisasList
        visas={visas}
        loading={isLoading}
        error={error}
        onEdit={handleEditVisa}
        onDelete={handleDeleteVisa}
      />
    </div>
  );
};
