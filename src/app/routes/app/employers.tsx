import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { EmployersList } from '@/features/employers/components/employers-list';
import { EmployerForm } from '@/features/employers/components/employer-form';
import type { CreateEmployerFormData } from '@/features/employers/schemas';
import type { Employer } from '@/features/employers/types';
import { useEmployers, useAddEmployer, useUpdateEmployer, useDeleteEmployer } from '@/features/employers/api/use-employers';

export const EmployersRoute = () => {
  const [isAddingEmployer, setIsAddingEmployer] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);

  // React Query hooks - cache, loading, error handling automatique
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employers</h1>
          <p className="text-muted-foreground">
            Manage your employers and their information
          </p>
        </div>
        <Button onClick={() => setIsAddingEmployer(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employer
        </Button>
      </div>

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