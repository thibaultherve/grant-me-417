import { Link, useNavigate, useParams } from 'react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import {
  useGetEmployer,
  useUpdateEmployer,
} from '@/features/employers/api/use-employers';
import { EmployerForm } from '@/features/employers/components/employer-form';

import type { CreateEmployerFormData } from '@/features/employers/schemas';

export function EmployerEditRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employer, isLoading, error } = useGetEmployer(id);
  const { mutateAsync: updateEmployer, isPending } = useUpdateEmployer();

  const handleSubmit = async (data: CreateEmployerFormData) => {
    if (!id) return;
    await updateEmployer({ id, input: data });
    navigate(paths.app.employers.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.employers.getHref());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
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

  // Error state - employer not found or access denied
  if (error || !employer) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={paths.app.employers.getHref()}>Employers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Employer</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={paths.app.employers.getHref()}>Employers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit {employer.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <h1 className="text-2xl font-bold">Edit Employer</h1>

      {/* Form in Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployerForm
            mode="edit"
            employer={employer}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
