import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/info-card';
import { Plus, Building2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { EmployersList } from '@/features/employers/components/employers-list';
import { EmployerForm } from '@/features/employers/components/employer-form';
import type { CreateEmployerFormData } from '@/features/employers/schemas';
import type { Employer } from '@/features/employers/types';
import { useEmployers, useAddEmployer, useUpdateEmployer, useDeleteEmployer } from '@/features/employers/api/use-employers';

export const EmployersRoute = () => {
  const [isAddingEmployer, setIsAddingEmployer] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);

  // React Query hooks
  const { data: employers = [], isLoading: loading, error } = useEmployers();
  const addMutation = useAddEmployer();
  const updateMutation = useUpdateEmployer();
  const deleteMutation = useDeleteEmployer();

  const handleAddEmployer = (data: CreateEmployerFormData) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        setIsAddingEmployer(false);
      },
    });
  };

  const handleEditEmployer = (data: CreateEmployerFormData) => {
    if (!editingEmployer) return;

    updateMutation.mutate(
      { id: editingEmployer.id, input: data },
      {
        onSuccess: () => {
          setEditingEmployer(null);
        },
      }
    );
  };

  const handleStartEdit = (employer: Employer) => {
    setEditingEmployer(employer);
  };

  const handleDeleteEmployer = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employers</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your employers and work locations
          </p>
        </div>
        <Button onClick={() => setIsAddingEmployer(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Employer
        </Button>
      </div>

      {/* Info tip */}
      {employers.length === 0 && !loading && (
        <InfoCard variant="accent">
          <div className="flex items-start gap-4">
            <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Add your first employer</h3>
              <p className="text-sm text-muted-foreground">
                Track where you've worked during your Working Holiday Visa. Add employer details to organize your work hours.
              </p>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Pass all state and handlers as props - Lift State Up pattern */}
      <EmployersList 
        employers={employers}
        loading={loading}
        error={error}
        onEdit={handleStartEdit}
        onDelete={handleDeleteEmployer}
      />

      <Sheet open={isAddingEmployer} onOpenChange={setIsAddingEmployer}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add New Employer</SheetTitle>
          </SheetHeader>
          <EmployerForm
            mode="add"
            onSubmit={handleAddEmployer}
            onCancel={() => setIsAddingEmployer(false)}
            isSubmitting={addMutation.isPending}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={!!editingEmployer} onOpenChange={(open) => !open && setEditingEmployer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Edit Employer</SheetTitle>
          </SheetHeader>
          {editingEmployer && (
            <EmployerForm
              mode="edit"
              employer={editingEmployer}
              onSubmit={handleEditEmployer}
              onCancel={() => setEditingEmployer(null)}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};