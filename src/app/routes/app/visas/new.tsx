import { useNavigate } from 'react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { useAddVisa } from '@/features/visas/api/use-visas';
import { VisaForm } from '@/features/visas/components/visa-form';
import type { CreateVisaFormData } from '@/features/visas/schemas';

export function VisaNewRoute() {
  const navigate = useNavigate();
  const { mutateAsync: addVisa, isPending } = useAddVisa();

  const handleSubmit = async (data: CreateVisaFormData) => {
    await addVisa(data);
    navigate(paths.app.visas.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.visas.getHref());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Visa</CardTitle>
        </CardHeader>
        <CardContent>
          <VisaForm
            mode="add"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
