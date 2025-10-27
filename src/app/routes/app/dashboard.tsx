import { Card, CardContent } from "@/components/ui/card";
import { InfoCard } from "@/components/ui/info-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { VisaSelector } from "@/features/visas/components/visa-selector";
import { WeeklyProgressChart } from "@/features/visas/components/weekly-progress-chart";
import { useVisaContext } from "@/features/visas/hooks/use-visa-context";
import { Briefcase, Calendar, CheckCircle2, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/config/paths";

export const DashboardRoute = () => {
  const { currentVisa } = useVisaContext();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const getVisaTypeLabel = (visaType: string) => {
    switch (visaType) {
      case "first_whv":
        return "1st Working Holiday Visa";
      case "second_whv":
        return "2nd Working Holiday Visa";
      case "third_whv":
        return "3rd Working Holiday Visa";
      default:
        return "Working Holiday Visa";
    }
  };

  const calculateVisaPeriodProgress = (
    arrivalDate: string,
    endDate: string
  ) => {
    const today = new Date();
    const start = new Date(arrivalDate);
    const end = new Date(endDate);

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back,</h1>
          <p className="mt-1 text-muted-foreground">
            Track your Working Holiday Visa progress and manage your work hours.
          </p>
        </div>
        <VisaSelector />
      </div>

      {!currentVisa ? (
        <InfoCard variant="accent">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Get started with Grant Me 417</h2>
              <p className="text-sm text-muted-foreground">
                Start tracking your specified work hours to qualify for your next Working Holiday Visa.
                Create your first visa to begin.
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
          {/* Visa Status Overview */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              label={getVisaTypeLabel(currentVisa.visa_type)}
              variant="info"
            />
            {currentVisa.is_eligible ? (
              <StatusBadge
                label="Eligible for Next Visa"
                variant="success"
                icon={CheckCircle2}
              />
            ) : (
              <StatusBadge
                label="In Progress"
                variant="warning"
                icon={Clock}
              />
            )}
          </div>

          {/* Stats Grid */}
          {(() => {
            const visaPeriod = calculateVisaPeriodProgress(
              currentVisa.arrival_date,
              currentVisa.end_date
            );

            return (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Work Days Completed"
                  value={currentVisa.eligible_days}
                  description={`of ${currentVisa.days_required} required`}
                  icon={Briefcase}
                  trend={
                    currentVisa.eligible_days > 0
                      ? {
                          value: Number(currentVisa.progress_percentage),
                          label: "progress"
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Days Remaining"
                  value={currentVisa.days_remaining}
                  description="to complete requirement"
                  icon={Calendar}
                />
                <StatCard
                  title="Visa Period"
                  value={formatDaysLeft(visaPeriod.daysLeft)}
                  description={`${visaPeriod.progress.toFixed(0)}% used`}
                  icon={Clock}
                />
                <StatCard
                  title="Overall Progress"
                  value={`${currentVisa.progress_percentage}%`}
                  description={currentVisa.is_eligible ? "Completed!" : "In progress"}
                  icon={TrendingUp}
                />
              </div>
            );
          })()}

          {/* Progress Overview Card */}
          {(() => {
            const visaPeriod = calculateVisaPeriodProgress(
              currentVisa.arrival_date,
              currentVisa.end_date
            );
            const isWorkComplete = currentVisa.is_eligible;

            return (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-6">Progress Details</h2>

                  <div className="space-y-8">
                    {/* Work Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Work Requirement</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {currentVisa.eligible_days} / {currentVisa.days_required} days
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
                          ? "✓ Work requirement completed!"
                          : `${currentVisa.days_remaining} days remaining`
                        }
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
                          {formatDate(currentVisa.arrival_date)} - {formatDate(currentVisa.end_date)}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${visaPeriod.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDaysLeft(visaPeriod.daysLeft)} ({visaPeriod.progress.toFixed(0)}% used)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Quick Actions Card */}
          <InfoCard variant="accent">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold mb-1">Track your work hours</h3>
                <p className="text-sm text-muted-foreground">
                  Log your specified work hours to track progress toward your next visa.
                </p>
              </div>
              <Button asChild>
                <Link to={paths.app.hours.path}>
                  Add Hours
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </InfoCard>

          {/* Weekly Progress Chart */}
          <WeeklyProgressChart />
        </>
      )}
    </div>
  );
};
