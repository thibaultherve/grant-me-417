import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { parseISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { AddHoursForm } from '@/features/hours/components/forms/add-hours-form';
import { isWeekStarted } from '@/features/hours/utils/week-validation';

export function HoursEditRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const weekParam = searchParams.get('week');

  // Parse and validate the week parameter
  const initialWeek = useMemo(() => {
    if (!weekParam) return undefined;
    const parsed = parseISO(weekParam);
    if (isNaN(parsed.getTime())) return undefined;
    return parsed;
  }, [weekParam]);

  // Redirect if the week hasn't started yet
  useEffect(() => {
    if (initialWeek && !isWeekStarted(initialWeek)) {
      navigate(paths.app.hours.getHref(), { replace: true });
    }
  }, [initialWeek, navigate]);

  // Don't render while redirecting
  if (initialWeek && !isWeekStarted(initialWeek)) {
    return null;
  }

  const handleBack = () => {
    navigate(paths.app.hours.getHref());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log your work hours</CardTitle>
        </CardHeader>
        <CardContent>
          <AddHoursForm onCancel={handleBack} initialWeek={initialWeek} />
        </CardContent>
      </Card>
    </div>
  );
}
