import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const VisasRoute = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visas</h1>
        <p className="text-muted-foreground">
          Track your visa progress and requirements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Second WHV (417)</CardTitle>
              <Badge variant="secondary">Not Started</Badge>
            </div>
            <CardDescription>
              Complete 88 days of specified work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">0 / 88 days</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: '0%' }} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Requirements:</p>
              <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                <li>88 calendar days of specified work</li>
                <li>Work in eligible regional areas</li>
                <li>Eligible industries only</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Third WHV (417)</CardTitle>
              <Badge variant="outline">Not Eligible</Badge>
            </div>
            <CardDescription>
              Complete 179 days of specified work during 2nd WHV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">0 / 179 days</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: '0%' }} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Requirements:</p>
              <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                <li>179 calendar days of specified work</li>
                <li>Must be completed during 2nd WHV</li>
                <li>Minimum 6 calendar months period</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};