import { Link, useNavigate } from 'react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { EmployerForm } from '@/features/employers/components/employer-form';
import { useAddEmployer } from '@/features/employers/api/use-employers';

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
            <BreadcrumbPage>New Employer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <h1 className="text-2xl font-bold">Add New Employer</h1>

      {/* Form in Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employer Details</CardTitle>
        </CardHeader>
        <CardContent>
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
