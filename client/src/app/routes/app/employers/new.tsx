import { useNavigate } from 'react-router';

import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { useAddEmployer } from '@/features/employers/api/use-employers';
import { EmployerForm } from '@/features/employers/components/employer-form';
import type { CreateEmployerFormData } from '@/features/employers/schemas';

export function EmployerNewRoute() {
  const navigate = useNavigate();
  const { mutateAsync: addEmployer, isPending } = useAddEmployer();

  const handleSubmit = async (data: CreateEmployerFormData) => {
    await addEmployer(data);
    navigate(paths.app.employers.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.employers.getHref());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <EmployerForm
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
