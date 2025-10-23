import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VisaSelector } from "@/features/visas/components/visa-selector";
import { WeeklyProgressChart } from "@/features/visas/components/weekly-progress-chart";
import { useVisaContext } from "@/features/visas/hooks/use-visa-context";
import { Briefcase, Calendar, CheckCircle2, Clock } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Track your WHV work progress here.
          </p>
        </div>
        <VisaSelector />
      </div>

      {currentVisa &&
        (() => {
          const visaPeriod = calculateVisaPeriodProgress(
            currentVisa.arrival_date,
            currentVisa.end_date
          );
          const isWorkComplete = currentVisa.is_eligible;
          const workProgressColor = isWorkComplete
            ? "bg-green-500"
            : "bg-primary";
          const workProgressBgColor = isWorkComplete
            ? "bg-green-100"
            : "bg-primary/20";

          return (
            <Card className="border-2">
              <CardContent className="p-6">
                {/* Header with Visa Type Badge and Status */}
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="outline" className="text-sm font-medium">
                    {getVisaTypeLabel(currentVisa.visa_type)}
                  </Badge>
                  {isWorkComplete ? (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Eligible
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Visa Period Progress Bar - Amber */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold">Visa Period</h3>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">
                        Start
                      </span>
                      <span className="font-medium text-muted-foreground">
                        End
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">
                        {formatDate(currentVisa.arrival_date)}
                      </span>
                      <span className="font-semibold">
                        {formatDate(currentVisa.end_date)}
                      </span>
                    </div>

                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-amber-100">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${visaPeriod.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {visaPeriod.daysPassed} days elapsed
                      </span>
                      <span className="font-medium text-amber-700">
                        {formatDaysLeft(visaPeriod.daysLeft)}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">
                        {visaPeriod.progress.toFixed(1)}% of visa period used
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Work Requirement Progress Bar - Blue/Green */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Work Progress</h3>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">
                        Start
                      </span>
                      <span className="font-medium text-muted-foreground">
                        Goal
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">0 days</span>
                      <span className="font-semibold">
                        {currentVisa.days_required} days
                      </span>
                    </div>

                    <div
                      className={`relative h-3 w-full overflow-hidden rounded-full ${workProgressBgColor}`}
                    >
                      <div
                        className={`h-full ${workProgressColor} transition-all`}
                        style={{
                          width: `${Math.min(
                            100,
                            Number(currentVisa.progress_percentage)
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {currentVisa.eligible_days} of{" "}
                        {currentVisa.days_required} days
                      </span>
                      <span
                        className={`font-medium ${
                          isWorkComplete ? "text-green-700" : "text-primary"
                        }`}
                      >
                        {currentVisa.progress_percentage}%
                      </span>
                    </div>

                    <div className="text-center">
                      {isWorkComplete ? (
                        <span className="text-xs font-medium text-green-700">
                          ✓ Work requirement completed!
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {currentVisa.days_remaining} days remaining to
                          complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

      {/* Weekly Progress Chart */}
      {currentVisa && <WeeklyProgressChart />}
    </div>
  );
};
