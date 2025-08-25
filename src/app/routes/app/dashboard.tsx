import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VisaSelector } from '@/features/visas/components/visa-selector';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';

export const DashboardRoute = () => {
  const { currentVisa } = useVisaContext();

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentVisa?.days_worked || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {currentVisa?.days_required || 88} days required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentVisa?.eligible_days || 0}</div>
            <p className="text-xs text-muted-foreground">eligible days completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentVisa?.days_remaining || 0}</div>
            <p className="text-xs text-muted-foreground">days left to work</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentVisa?.progress_percentage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              towards {currentVisa?.visa_type === 'first_whv' ? '2nd WHV' : currentVisa?.visa_type === 'second_whv' ? '3rd WHV' : 'completion'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Work Entries</CardTitle>
          <CardDescription>Your latest work hour entries</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No work entries yet. Start by adding an employer and logging your work hours.</p>
        </CardContent>
      </Card>
    </div>
  );
};