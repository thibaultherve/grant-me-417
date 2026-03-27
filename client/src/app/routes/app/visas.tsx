import { Plane, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/info-card';
import { paths } from '@/config/paths';
import { useDeleteVisa } from '@/features/visas/api/use-visas';
import { VisasList } from '@/features/visas/components/visas-list';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';
import { visaTypeToSlug } from '@/features/visas/utils/visa-helpers';
import { usePageHeader } from '@/hooks/use-page-header';
import type { Visa } from '@regranted/shared';

export const VisasRoute = () => {
  const navigate = useNavigate();

  const { visas, isLoading, error } = useVisaContext();
  const deleteMutation = useDeleteVisa();

  usePageHeader({
    description: 'Manage your Working Holiday Visas (up to 3 visas)',
    action: () => (
      <Button
        asChild
        size="lg"
        className="w-full md:w-auto"
        disabled={visas.length >= 3}
      >
        <Link to={paths.app.visas.new.getHref()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Visa
        </Link>
      </Button>
    ),
  });

  const handleEditVisa = (visa: Visa) => {
    navigate(paths.app.visas.edit.getHref(visaTypeToSlug(visa.visaType)));
  };

  const handleDeleteVisa = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
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
