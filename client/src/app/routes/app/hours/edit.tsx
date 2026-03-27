import { parseISO } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { LogHoursPage } from '@/features/hours/components/log-hours-page';
import { isWeekStarted } from '@/features/hours/utils/week-validation';
import { usePageHeader } from '@/hooks/use-page-header';

export function HoursEditRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const weekParam = searchParams.get('week');

  usePageHeader({
    description: 'Log hours for each of your employers this week.',
  });

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

  return <LogHoursPage initialWeek={initialWeek} />;
}
