import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, LayoutDashboard } from 'lucide-react';
import { AddVisaForm } from '@/features/visas/components/add-visa-form';
import { VisasList } from '@/features/visas/components/visas-list';
import type { CreateVisaFormData } from '@/features/visas/schemas';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';
import { useAddVisa, useDeleteVisa } from '@/features/visas/api/use-visas';

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
      }
    });
  };

  const handleDeleteVisa = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visas</h1>
          <p className="text-muted-foreground">
            Manage your WHV here. Add up to 3 visas.
          </p>
        </div>
        <Button onClick={() => setIsAddingVisa(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Visa
        </Button>
      </div>

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
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
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