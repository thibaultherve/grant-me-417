import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import { useVisaOverview } from '@/features/dashboard/api/use-dashboard';
import { EligibleDaysCard } from '@/features/dashboard/components/eligible-days-card';
import { EmployerBreakdownCard } from '@/features/dashboard/components/employer-breakdown-card';
import { MonthlyTrendChart } from '@/features/dashboard/components/monthly-trend-chart';
import { PaceTrackerCard } from '@/features/dashboard/components/pace-tracker-card';
import { ThisWeekCard } from '@/features/dashboard/components/this-week-card';
import { VisaTimelineCard } from '@/features/dashboard/components/visa-timeline-card';
import { WeeklyProgressChart } from '@/features/dashboard/components/weekly-progress-chart';
import { WorkDistributionCard } from '@/features/dashboard/components/work-distribution-card';
import { VisaSelector } from '@/features/visas/components/visa-selector';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';
import { usePageHeader } from '@/hooks/use-page-header';

// ─── Skeleton layout for loading state ───────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Weekly progress */}
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
      {/* Distribution charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
      {/* Monthly trend */}
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Empty state: no visa selected ───────────────────────────────────────────

function NoVisaState() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-8 flex flex-col items-center text-center gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Get started with ReGranted</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start tracking your specified work hours to qualify for your next Working
            Holiday Visa. Create your first visa to begin.
          </p>
        </div>
        <Button asChild>
          <Link to={paths.app.visas.path}>
            Create Your First Visa
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="p-6">
        <p className="text-sm text-destructive font-medium">
          Failed to load dashboard data: {message}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard widgets ────────────────────────────────────────────────────────

function DashboardWidgets({ visaId }: { visaId: string }) {
  const { data: overview, isLoading, error } = useVisaOverview(visaId);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!overview) return null;

  return (
    <div className="space-y-6">
      {/* Stats grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EligibleDaysCard visa={overview.visa} />
        <VisaTimelineCard visa={overview.visa} />
        <PaceTrackerCard pace={overview.pace} />
        <ThisWeekCard thisWeek={overview.thisWeek} />
      </div>

      {/* Weekly Progress (full width) */}
      <WeeklyProgressChart overview={overview} />

      {/* Work Distribution + Employer Breakdown (2-col on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WorkDistributionCard workDistribution={overview.workDistribution} />
        <EmployerBreakdownCard employerBreakdown={overview.employerBreakdown} />
      </div>

      {/* Monthly Trend (full width) */}
      <MonthlyTrendChart
        monthlyTrend={overview.monthlyTrend}
        daysRequired={overview.visa.daysRequired}
      />
    </div>
  );
}

// ─── Main route ───────────────────────────────────────────────────────────────

export const DashboardRoute = () => {
  const { currentVisa, isLoading: visaLoading } = useVisaContext();

  usePageHeader({
    description: "Welcome back — Here's an overview of your WHV 417 progress.",
    action: () => <VisaSelector />,
  });

  return (
    <div className="space-y-6">
      {/* Content */}
      {visaLoading ? (
        <DashboardSkeleton />
      ) : !currentVisa ? (
        <NoVisaState />
      ) : (
        <DashboardWidgets visaId={currentVisa.id} />
      )}
    </div>
  );
};
