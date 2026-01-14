import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  Info,
  Plane,
} from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoCard } from '@/components/ui/info-card';
import { paths } from '@/config/paths';
import { VisaSelector } from '@/features/visas/components/visa-selector';
import { WeeklyProgressChart } from '@/features/visas/components/weekly-progress-chart';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';
import { getVisaLabel } from '@/features/visas/utils/visa-helpers';

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
      <div>
        <p className="text-muted-foreground">
          Track your Working Holiday Visa progress and manage your work hours.
        </p>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Hours Card */}
        <Card className="py-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">My Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your Hours.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link to={paths.app.hours.getHref()}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Employers Card */}
        <Card className="py-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">My Employers</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your employers.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link to={paths.app.employers.getHref()}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Visas Card */}
        <Card className="py-4">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">My Visas</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your visas.
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link to={paths.app.visas.getHref()}>
                  <Plane className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Visa Selector Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Active Visa</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select the visa you're currently tracking. All work hours and
                  progress displayed on this dashboard are linked to this visa.
                </p>
                {currentVisa && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {getVisaLabel(currentVisa.visa_type)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {currentVisa.progress_percentage}% complete
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-col lg:items-end">
              <VisaSelector />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Switch between your visas</span>
              </div>
            </div>
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
