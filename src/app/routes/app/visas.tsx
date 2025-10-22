import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { AddVisaForm } from '@/features/visas/components/add-visa-form';
import { VisasList } from '@/features/visas/components/visas-list';
import type { CreateVisaFormData } from '@/features/visas/schemas';
import { useVisas } from '@/features/visas/hooks/use-visas';

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

  const handleAddVisa = async (data: CreateVisaFormData) => {
    setIsSubmitting(true);
    const result = await addVisa(data);
    setIsSubmitting(false);

    if (result.success) {
      setIsAddingVisa(false);
    }
  };

  const handleDeleteVisa = async (id: string) => {
    await deleteVisa(id);
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

      {/* Pass all state and handlers as props - Lift State Up pattern */}
      <VisasList
        visas={visas}
        loading={loading}
        error={error}
        onDelete={handleDeleteVisa}
      />

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