import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { AddVisaForm } from '@/features/visas/components/add-visa-form';
import type { CreateVisaFormData } from '@/features/visas/schemas';

export const VisasRoute = () => {
  const [isAddingVisa, setIsAddingVisa] = useState(false);

  const handleAddVisaSubmit = async (data: CreateVisaFormData) => {
    console.log('Adding visa:', data);
    // TODO: Implement visa creation logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  const handleAddVisaSuccess = async () => {
    setIsAddingVisa(false);
    // TODO: Refresh visa data
  };

  const handleAddVisaError = (error: Error) => {
    console.error('Error adding visa:', error);
    // TODO: Show toast notification
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visas</h1>
          <p className="text-muted-foreground">
            Track your visa progress and requirements
          </p>
        </div>
        <Button onClick={() => setIsAddingVisa(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Visa
        </Button>
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

      <Sheet open={isAddingVisa} onOpenChange={setIsAddingVisa}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add New Visa</SheetTitle>
          </SheetHeader>
          <AddVisaForm
            onSubmit={handleAddVisaSubmit}
            onCancel={() => setIsAddingVisa(false)}
            isSubmitting={false}
            onError={handleAddVisaError}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};