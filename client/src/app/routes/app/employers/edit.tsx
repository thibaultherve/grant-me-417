import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import { useDeleteEmployer } from '@/features/employers/api/use-delete-employer';
import { useGetEmployer } from '@/features/employers/api/use-get-employer';
import { useUpdateEmployer } from '@/features/employers/api/use-update-employer';
import { EmployerForm } from '@/features/employers/components/employer-form';
import type { CreateEmployerFormData } from '@/features/employers/schemas';

export function EmployerEditRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employer, isLoading, error } = useGetEmployer(id);
  const { mutateAsync: updateEmployer, isPending: isUpdating } =
    useUpdateEmployer();
  const { mutateAsync: deleteEmployer, isPending: isDeleting } =
    useDeleteEmployer();

  const handleSubmit = async (data: CreateEmployerFormData) => {
    if (!id) return;
    await updateEmployer({ id, input: data });
    navigate(paths.app.employers.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.employers.getHref());
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteEmployer(id);
    navigate(paths.app.employers.getHref());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !employer) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Employer not found.</p>
            <Button variant="outline" onClick={handleCancel}>
              Back to Employers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <EmployerForm
            mode="edit"
            employer={employer}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={handleDelete}
            isSubmitting={isUpdating}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
