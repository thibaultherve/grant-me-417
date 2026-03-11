import { useNavigate } from 'react-router';

import { paths } from '@/config/paths';
import { useAddVisa } from '@/features/visas/api/use-visas';
import { VisaForm } from '@/features/visas/components/visa-form';
import type { CreateVisaFormData } from '@/features/visas/schemas';
import { usePageHeader } from '@/hooks/use-page-header';

export function VisaNewRoute() {
  const navigate = useNavigate();
  const { mutateAsync: addVisa, isPending } = useAddVisa();

  usePageHeader({
    description: 'Select your visa and enter your arrival date in Australia',
  });

  const handleSubmit = async (data: CreateVisaFormData) => {
    await addVisa(data);
    navigate(paths.app.visas.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.visas.getHref());
  };

  return (
    <div className="max-w-2xl">
      <VisaForm
        mode="add"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
      />
    </div>
  );
}
