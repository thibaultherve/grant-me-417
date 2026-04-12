import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import {
  useDeleteVisa,
  useGetVisaByType,
  useUpdateVisa,
} from '@/features/visas/api/use-visas';
import { VisaCard } from '@/features/visas/components/visa-card';
import { VisaForm } from '@/features/visas/components/visa-form';
import type { UpdateVisaFormData } from '@/features/visas/schemas';
import { usePageHeader } from '@/hooks/use-page-header';
import { slugToVisaType } from '@/utils/visa-helpers';

export function VisaEditRoute() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const visaType = slugToVisaType(type || '');
  const { data: visa, isLoading, error } = useGetVisaByType(visaType);
  const { mutateAsync: updateVisa, isPending } = useUpdateVisa();
  const deleteMutation = useDeleteVisa();

  usePageHeader({
    description: 'Update your visa arrival date',
  });

  const handleSubmit = async (data: UpdateVisaFormData) => {
    if (!visa) return;
    await updateVisa({ id: visa.id, input: data });
    navigate(paths.app.visas.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.visas.getHref());
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        navigate(paths.app.visas.getHref());
      },
    });
  };

  // Invalid visa type
  if (!visaType) {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Invalid visa type.</p>
            <Button variant="outline" onClick={handleCancel}>
              Back to Visas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Error state - visa not found
  if (error || !visa) {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Visa not found.</p>
            <Button variant="outline" onClick={handleCancel}>
              Back to Visas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Visa card preview (read-only) */}
      <VisaCard visa={visa} hideActions />

      {/* Edit form */}
      <VisaForm
        mode="edit"
        visa={visa}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDelete={handleDelete}
        isSubmitting={isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
