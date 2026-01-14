import { Pencil } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { MonthCalendar } from '@/features/hours/components/calendar';

export const HoursRoute = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold mb-1">Edit your work hours</h3>
              <p className="text-sm text-muted-foreground">
                Log your work hours to track progress toward your next visa.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to={paths.app.hours.edit.getHref()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Hours
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <MonthCalendar />
      </div>
    </div>
  );
};
