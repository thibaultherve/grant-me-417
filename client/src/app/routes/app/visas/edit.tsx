import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import {
  useGetVisaByType,
  useUpdateVisa,
} from '@/features/visas/api/use-visas';
import { VisaForm } from '@/features/visas/components/visa-form';
import type { UpdateVisaFormData } from '@/features/visas/schemas';
import { getVisaLabel, slugToVisaType } from '@/features/visas/utils/visa-helpers';

export function VisaEditRoute() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const visaType = slugToVisaType(type || '');
  const { data: visa, isLoading, error } = useGetVisaByType(visaType);
  const { mutateAsync: updateVisa, isPending } = useUpdateVisa();

  const handleSubmit = async (data: UpdateVisaFormData) => {
    if (!visa) return;
    await updateVisa({ id: visa.id, input: data });
    navigate(paths.app.visas.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.visas.getHref());
  };

  // Invalid visa type
  if (!visaType) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - visa not found
  if (error || !visa) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit {getVisaLabel(visa.visaType)}</CardTitle>
        </CardHeader>
        <CardContent>
          <VisaForm
            mode="edit"
            visa={visa}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
