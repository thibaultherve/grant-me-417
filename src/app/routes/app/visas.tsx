import { Plus, LayoutDashboard, Plane } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/info-card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAddVisa, useDeleteVisa } from '@/features/visas/api/use-visas';
import { AddVisaForm } from '@/features/visas/components/add-visa-form';
import { VisasList } from '@/features/visas/components/visas-list';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';
import type { CreateVisaFormData } from '@/features/visas/schemas';

export const VisasRoute = () => {
  const [isAddingVisa, setIsAddingVisa] = useState(false);

  // React Query hooks
  const { visas, isLoading, error } = useVisaContext();
  const addMutation = useAddVisa();
  const deleteMutation = useDeleteVisa();

  const handleAddVisa = (data: CreateVisaFormData) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        setIsAddingVisa(false);
      },
    });
  };

  const handleDeleteVisa = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visas</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your Working Holiday Visas (up to 3 visas)
          </p>
        </div>
        <Button
          onClick={() => setIsAddingVisa(true)}
          size="lg"
          disabled={visas.length >= 3}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Visa
        </Button>
      </div>

      {/* Info tip */}
      {visas.length === 0 && !isLoading && (
        <InfoCard variant="accent">
          <div className="flex items-start gap-4">
            <Plane className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Create your first visa</h3>
              <p className="text-sm text-muted-foreground">
                Start by adding your current Working Holiday Visa (subclass
                417). You can track work progress for up to 3 visas.
              </p>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Pass all state and handlers as props - Lift State Up pattern */}
      <VisasList
        visas={visas}
        loading={isLoading}
        error={error}
        onDelete={handleDeleteVisa}
      />

      <div className="flex justify-center pt-8">
        <Button asChild variant="outline" size="lg">
          <Link to="/app">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>

      <Sheet open={isAddingVisa} onOpenChange={setIsAddingVisa}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-4xl overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>Add New Visa</SheetTitle>
          </SheetHeader>
          <AddVisaForm
            onSubmit={handleAddVisa}
            onCancel={() => setIsAddingVisa(false)}
            isSubmitting={addMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
