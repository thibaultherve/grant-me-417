import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { CalendarDays, Calendar, Building2, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Stepper } from './stepper'
import { EmployerSelector } from './employer-selector'
import { ByDayForm } from './by-day-form'
import { ByWeekForm } from './by-week-form'

import { useEmployers } from '@/features/employers/hooks/use-employers'
import { useAddHours } from '../hooks/use-add-hours'
import { useEmployerHours } from '../hooks/use-employer-hours'
import type { Employer } from '@/features/employers/types'
import type { MultipleWorkEntriesFormData, WeekWorkEntryFormData } from '../schemas'

interface AddHoursFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function AddHoursForm({ onSuccess, onCancel, className }: AddHoursFormProps) {
  // State management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null)
  const [mode, setMode] = useState<'by-day' | 'by-week'>('by-day')
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingData, setPendingData] = useState<{
    type: 'day' | 'week'
    data: MultipleWorkEntriesFormData | WeekWorkEntryFormData
    existingDates: string[]
    existingEntries?: Array<{
      work_date: string
      oldHours: number
      newHours: number
      action?: 'update' | 'delete'
    }>
  } | null>(null)

  // Hooks
  const { employers, loading: employersLoading } = useEmployers()
  const { 
    isSubmitting, 
    addWorkEntries, 
    addWorkEntriesWithOverwrite,
    addWeekWorkEntries,
    addWeekWorkEntriesWithOverwrite 
  } = useAddHours()

  // Load ALL hours for the selected employer (for calendar badges)
  const {
    hoursByDate,
    isLoading: _hoursLoading,
    totalHours: _totalHours,
    totalEntries: _totalEntries
  } = useEmployerHours({
    employerId: selectedEmployer?.id || '',
    enabled: !!selectedEmployer
  })

  // Handlers
  const handleEmployerSelect = (employer: Employer) => {
    setSelectedEmployer(employer)
    // Stay on step 1 until user clicks Continue
  }

  const handleContinueToAddHours = () => {
    setCurrentStep(2)
  }

  const handleBackToEmployerSelection = () => {
    setCurrentStep(1)
    // Keep selected employer but allow changing it
  }

  const handleByDaySubmit = async (data: MultipleWorkEntriesFormData) => {
    const result = await addWorkEntries(data)
    
    if (result.requiresConfirmation && result.existingDates) {
      setPendingData({ 
        type: 'day', 
        data, 
        existingDates: result.existingDates,
        existingEntries: result.existingEntries
      })
      setShowConfirmDialog(true)
      return
    }
    
    if (result.success) {
      onSuccess?.()
    }
  }

  const handleByWeekSubmit = async (data: WeekWorkEntryFormData) => {
    const result = await addWeekWorkEntries(data)
    
    if (result.requiresConfirmation && result.existingDates) {
      setPendingData({ 
        type: 'week', 
        data, 
        existingDates: result.existingDates,
        existingEntries: result.existingEntries
      })
      setShowConfirmDialog(true)
      return
    }
    
    if (result.success) {
      onSuccess?.()
    }
  }

  const handleConfirmOverwrite = async () => {
    if (!pendingData) return

    let result
    if (pendingData.type === 'day') {
      result = await addWorkEntriesWithOverwrite(pendingData.data as MultipleWorkEntriesFormData)
    } else {
      result = await addWeekWorkEntriesWithOverwrite(pendingData.data as WeekWorkEntryFormData)
    }

    setShowConfirmDialog(false)
    setPendingData(null)

    if (result.success) {
      onSuccess?.()
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false)
    setPendingData(null)
  }

  const industryLabels: Record<string, string> = {
    plant_and_animal_cultivation: "Plant & Animal Cultivation",
    fishing_and_pearling: "Fishing & Pearling",
    tree_farming_and_felling: "Tree Farming & Felling",
    mining: "Mining",
    construction: "Construction",
    hospitality_and_tourism: "Hospitality & Tourism",
    bushfire_recovery_work: "Bushfire Recovery",
    critical_covid19_work: "Critical COVID-19 Work",
    other: "Other",
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Stepper currentStep={currentStep} />

      {/* Step 1: Employer Selection */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <EmployerSelector
            employers={employers}
            selectedEmployer={selectedEmployer}
            onSelectEmployer={handleEmployerSelect}
            onContinue={handleContinueToAddHours}
            loading={employersLoading}
          />

          {/* Action Buttons */}
          <div className="flex justify-between pt-2 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Hours Entry */}
      {currentStep === 2 && selectedEmployer && (
        <div className="space-y-4">
          {/* Selected Employer - Simple text with Change link */}
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{selectedEmployer.name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {industryLabels[selectedEmployer.industry] || selectedEmployer.industry}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToEmployerSelection}
              className="h-8 text-xs"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Change
            </Button>
          </div>

          {/* Mode Selection and Forms */}
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'by-day' | 'by-week')}>
            <TabsList className="grid w-full grid-cols-2 p-0 h-auto bg-transparent">
              <TabsTrigger
                value="by-day"
                className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted/50"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">By Day</span>
                <span className="sm:hidden">Day</span>
              </TabsTrigger>
              <TabsTrigger
                value="by-week"
                className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted/50"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">By Week</span>
                <span className="sm:hidden">Week</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="by-day" className="mt-1">
              <ByDayForm
                employerId={selectedEmployer.id}
                hoursByDate={hoursByDate}
                onSubmit={handleByDaySubmit}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="by-week" className="mt-1">
              <ByWeekForm
                employerId={selectedEmployer.id}
                hoursByDate={hoursByDate}
                onSubmit={handleByWeekSubmit}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingData?.type === 'week' ? 'Update Work Week?' : 'Update Hours?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  {pendingData?.type === 'week'
                    ? 'Work hours already exist for some dates in this week:'
                    : 'Work hours already exist for the following dates:'}
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="text-sm space-y-2">
                    {pendingData?.existingEntries ? (
                      pendingData.existingEntries.map(entry => {
                        const isDelete = entry.action === 'delete' || entry.newHours === 0
                        return (
                          <li key={entry.work_date} className="flex items-center gap-2">
                            <span className={cn(
                              "font-mono",
                              isDelete && "line-through text-muted-foreground"
                            )}>
                              • {new Date(entry.work_date).toLocaleDateString('en-AU', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className={cn(
                                "line-through",
                                isDelete ? "text-muted-foreground" : "text-destructive"
                              )}>
                                {entry.oldHours}h
                              </span>
                              {isDelete ? (
                                <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded">
                                  DELETED
                                </span>
                              ) : (
                                <>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-green-600 font-bold">
                                    {entry.newHours}h
                                  </span>
                                </>
                              )}
                            </span>
                          </li>
                        )
                      })
                    ) : (
                      pendingData?.existingDates.map(date => (
                        <li key={date} className="font-mono">
                          • {new Date(date).toLocaleDateString('en-AU', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <p>
                  {pendingData?.type === 'week'
                    ? 'Do you want to proceed with these changes?'
                    : 'Do you want to overwrite the existing hours?'}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirmation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmOverwrite}
            >
              {pendingData?.type === 'week' ? 'Update Week' : 'Update'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}