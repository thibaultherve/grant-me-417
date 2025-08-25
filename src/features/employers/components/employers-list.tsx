import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Plus, Building2 } from 'lucide-react'
import { useEmployers } from '../hooks/use-employers'
import { AddEmployerForm } from './add-employer-form'
import { EmployerCard } from './employer-card'
import type { CreateEmployerFormData } from '../schemas'

export function EmployersList() {
  const [isAddingEmployer, setIsAddingEmployer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { employers, loading, error, addEmployer } = useEmployers()

  const handleAddEmployer = async (data: CreateEmployerFormData) => {
    setIsSubmitting(true)
    const result = await addEmployer(data)
    setIsSubmitting(false)
    
    if (result.success) {
      setIsAddingEmployer(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Employers</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading employers...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Employers</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-destructive">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your employers for specified work
          </p>
        </div>
        <Button 
          size="sm" 
          className="gap-2"
          onClick={() => setIsAddingEmployer(true)}
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {employers.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="font-medium mb-2">No employers yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first employer to start tracking work
          </p>
          <Button onClick={() => setIsAddingEmployer(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Employer
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {employers.map((employer) => (
            <EmployerCard key={employer.id} employer={employer} />
          ))}
        </div>
      )}

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
  )
}