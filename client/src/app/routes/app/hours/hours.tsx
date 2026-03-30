import { Pencil } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { WeeklyCalendar } from '@/features/hours/components/calendar/weekly-calendar';
import { usePageHeader } from '@/hooks/use-page-header';

export const HoursRoute = () => {
  usePageHeader({
    description: 'Log your work hours to track progress toward your next visa.',
    action: () => (
      <Button asChild size="lg" className="w-full md:w-auto">
        <Link to={paths.app.hours.edit.getHref()}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Hours
        </Link>
      </Button>
    ),
  });

  return (
    <div className="space-y-6">
      <WeeklyCalendar />
    </div>
  );
};
