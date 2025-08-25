import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { EmployersList } from '@/features/employers/components/employers-list';
import { AddEmployerForm } from '@/features/employers/components/add-employer-form';
import type { CreateEmployerFormData } from '@/features/employers/schemas';
import { useEmployers } from '@/features/employers/hooks/use-employers';

export const EmployersRoute = () => {
  const [isAddingEmployer, setIsAddingEmployer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addEmployer } = useEmployers();

  const handleAddEmployer = async (data: CreateEmployerFormData) => {
    setIsSubmitting(true);
    const result = await addEmployer(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setIsAddingEmployer(false);
    }
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

      <EmployersList />

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
    </div>
  );
};