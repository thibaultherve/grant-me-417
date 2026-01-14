import { useNavigate } from 'react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { AddHoursForm } from '@/features/hours/components/forms/add-hours-form';

export function HoursEditRoute() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(paths.app.hours.getHref());
  };

  return (
    <div className="space-y-6">
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
