import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, LayoutDashboard } from 'lucide-react';
import { AddVisaForm } from '@/features/visas/components/add-visa-form';
import { VisasList } from '@/features/visas/components/visas-list';
import type { CreateVisaFormData } from '@/features/visas/schemas';
import { useVisas } from '@/features/visas/hooks/use-visas';
import { useVisaContext } from '@/features/visas/hooks/use-visa-context';

export const VisasRoute = () => {
  const [isAddingVisa, setIsAddingVisa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single source of truth for visas data
  const {
    visas,
    loading,
    error,
    addVisa,
    deleteVisa,
  } = useVisas();

  // Get refreshVisas function from context to update available visas list
  const { refreshVisas } = useVisaContext();

  const handleAddVisa = async (data: CreateVisaFormData) => {
    setIsSubmitting(true);
    const result = await addVisa(data);
    setIsSubmitting(false);

    if (result.success) {
      setIsAddingVisa(false);
      // Refresh context to update available visas list
      await refreshVisas();
    }
  };

  const handleDeleteVisa = async (id: string) => {
    const result = await deleteVisa(id);

    if (result.success) {
      // Refresh context to update available visas list
      await refreshVisas();
    }
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
        loading={loading}
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
            isSubmitting={isSubmitting}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};