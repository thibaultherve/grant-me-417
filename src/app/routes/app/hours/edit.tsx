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
import { AddHoursForm } from '@/features/hours/components/add-hours-form';

export function HoursEditRoute() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(paths.app.hours.getHref());
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={paths.app.hours.getHref()}>Work Hours</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Hours</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <h1 className="text-2xl font-bold">Edit Hours</h1>

      {/* Form in Card */}
      <Card>
        <CardHeader>
          <CardTitle>Log your work hours</CardTitle>
        </CardHeader>
        <CardContent>
          <AddHoursForm onCancel={handleBack} />
        </CardContent>
      </Card>
    </div>
  );
}
