import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { EmployersList } from '@/features/employers/components/employers-list';
import { AddEmployerForm } from '@/features/employers/components/add-employer-form';
import { EditEmployerForm } from '@/features/employers/components/edit-employer-form';
import type { CreateEmployerFormData } from '@/features/employers/schemas';
import type { Employer } from '@/features/employers/types';
import { useEmployers } from '@/features/employers/hooks/use-employers';

export const EmployersRoute = () => {
  const [isAddingEmployer, setIsAddingEmployer] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Single source of truth for employers data
  const { 
    employers, 
    loading, 
    error, 
    addEmployer, 
    updateEmployer, 
    deleteEmployer 
  } = useEmployers();

  const handleAddEmployer = async (data: CreateEmployerFormData) => {
    setIsSubmitting(true);
    const result = await addEmployer(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setIsAddingEmployer(false);
    }
  };

  const handleEditEmployer = async (data: CreateEmployerFormData) => {
    if (!editingEmployer) return;
    
    setIsSubmitting(true);
    const result = await updateEmployer(editingEmployer.id, data);
    setIsSubmitting(false);
    
    if (result.success) {
      setEditingEmployer(null);
    }
  };

  const handleStartEdit = (employer: Employer) => {
    setEditingEmployer(employer);
  };

  const handleDeleteEmployer = async (id: string) => {
    await deleteEmployer(id);
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
          <AddEmployerForm
            onSubmit={handleAddEmployer}
            onCancel={() => setIsAddingEmployer(false)}
            isSubmitting={isSubmitting}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={!!editingEmployer} onOpenChange={(open) => !open && setEditingEmployer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Edit Employer</SheetTitle>
          </SheetHeader>
          {editingEmployer && (
            <EditEmployerForm
              employer={editingEmployer}
              onSubmit={handleEditEmployer}
              onCancel={() => setEditingEmployer(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};