import { ArrowRight, Briefcase, Calendar, CalendarClock } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoCard } from '@/components/ui/info-card';
import { paths } from '@/config/paths';
import { VisaSelector } from '@/features/visas/components/visa-selector';
import { WeeklyProgressChart } from '@/features/visas/components/weekly-progress-chart';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';

export const DashboardRoute = () => {
  const { currentVisa } = useVisaContext();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const calculateVisaPeriodProgress = (
    arrivalDate: string,
    expiryDate: string,
  ) => {
    const today = new Date();
    const start = new Date(arrivalDate);
    const end = new Date(expiryDate);

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysPassed = Math.ceil(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysLeft = Math.max(0, totalDays - daysPassed);

    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    return {
      totalDays,
      daysPassed,
      daysLeft,
      progress,
    };
  };

  const formatDaysLeft = (days: number) => {
    return days === 1 ? `${days} day left` : `${days} days left`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-muted-foreground">
            Track your Working Holiday Visa progress and manage your work hours.
          </p>
        </div>
        <VisaSelector />
      </div>

      {/* Quick Actions Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold mb-1">Track your work hours</h3>
              <p className="text-sm text-muted-foreground">
                Log your specified work hours to track progress toward your next
                visa.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to={paths.app.hours.getHref()}>
                <CalendarClock className="mr-2 h-4 w-4" />
                My Hours
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {!currentVisa ? (
        <InfoCard variant="accent">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Get started with Grant Me 417
              </h2>
              <p className="text-sm text-muted-foreground">
                Start tracking your specified work hours to qualify for your
                next Working Holiday Visa. Create your first visa to begin.
              </p>
            </div>
            <Button asChild className="w-fit">
              <Link to={paths.app.visas.path}>
                Create Your First Visa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </InfoCard>
      ) : (
        <>
          {/* Progress Overview Card */}
          {(() => {
            const visaPeriod = calculateVisaPeriodProgress(
              currentVisa.arrival_date,
              currentVisa.expiry_date,
            );
            const isWorkComplete = currentVisa.is_eligible;

            return (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-6">
                    Progress Details
                  </h2>

                  <div className="space-y-8">
                    {/* Work Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Work Requirement</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {currentVisa.eligible_days} /{' '}
                          {currentVisa.days_required} days
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full transition-all ${
                            isWorkComplete ? 'bg-success' : 'bg-primary'
                          }`}
                          style={{
                            width: `${Math.min(100, Number(currentVisa.progress_percentage))}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isWorkComplete
                          ? '✓ Work requirement completed!'
                          : `${currentVisa.days_remaining} days remaining`}
                      </p>
                    </div>

                    {/* Visa Period */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Visa Period</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(currentVisa.arrival_date)} -{' '}
                          {formatDate(currentVisa.expiry_date)}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-warning transition-all"
                          style={{ width: `${visaPeriod.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDaysLeft(visaPeriod.daysLeft)} (
                        {visaPeriod.progress.toFixed(0)}% used)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Weekly Progress Chart */}
          <WeeklyProgressChart />
        </>
      )}
    </div>
  );
};
