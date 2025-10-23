import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CalendarWithHours } from './calendar-with-hours'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDays, Plus, X, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

import { HoursInput } from './hours-input'
import type { MultipleWorkEntriesFormData } from '../schemas'

// Import utility functions
import {
  calculateTotalHours,
  mergeOrAddEntry,
  createWorkEntry,
  removeEntryById,
  type WorkEntry
} from '../utils/day-calculations'
import { isDateDisabled } from '../utils/date-validation'

interface ByDayFormProps {
  employerId: string
  hoursByDate: { [date: string]: number }
  onSubmit: (data: MultipleWorkEntriesFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function ByDayForm({ employerId, hoursByDate, onSubmit, onCancel, isSubmitting = false }: ByDayFormProps) {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [hoursInput, setHoursInput] = useState('')
  const [decimalHours, setDecimalHours] = useState(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isHoursValid, setIsHoursValid] = useState(true)

  // Auto-fill hours when a date with existing data is selected
  useEffect(() => {
    if (!selectedDate) {
      return
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd')
    const existingHours = hoursByDate[dateString]

    if (existingHours && existingHours > 0) {
      // Pre-fill the hours input with existing hours
      setHoursInput(existingHours.toString())
      setDecimalHours(existingHours)
    } else {
      // Reset if no existing hours
      setHoursInput('')
      setDecimalHours(0)
    }
  }, [selectedDate, hoursByDate])

  // Handle hours input change
  const handleHoursChange = (value: string, decimal: number) => {
    setHoursInput(value)
    setDecimalHours(decimal)
  }

  // Handle hours validation change
  const handleHoursValidation = (isValid: boolean) => {
    setIsHoursValid(isValid)
  }

  // Add a new work entry
  const handleAddEntry = () => {
    if (!selectedDate || !isHoursValid) return

    // Create new entry using utility function
    const newEntry = createWorkEntry(selectedDate, decimalHours)

    // Merge or add entry using utility function
    setEntries(prev => mergeOrAddEntry(prev, newEntry))

    // Reset inputs
    setSelectedDate(undefined)
    setHoursInput('')
    setDecimalHours(0)
    setIsCalendarOpen(false)
  }

  // Remove an entry
  const handleRemoveEntry = (entryId: string) => {
    setEntries(prev => removeEntryById(prev, entryId))
  }

  // Submit the form
  const handleFormSubmit = () => {
    if (entries.length === 0) return

    const formData: MultipleWorkEntriesFormData = {
      employer_id: employerId,
      entries: entries.map(entry => ({
        work_date: entry.work_date,
        hours_worked: entry.hours_worked
      }))
    }

    onSubmit(formData)
  }

  // Calculate total hours using utility function
  const totalHours = calculateTotalHours(entries)

  return (
    <div className="space-y-3">
      {/* Mode Description */}
      <p className="text-xs text-muted-foreground italic mb-2">
        Manual: Enter hours for each day individually
      </p>

      {/* Date and Hours Input */}
      <div className="space-y-3">
        {/* Date Selection and Hours Input on same line */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date-picker" className="text-xs">Work Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-9',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarWithHours
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date as Date | undefined)
                    setIsCalendarOpen(false)
                  }}
                  disabled={isDateDisabled}
                  hoursByDate={hoursByDate}
                  disableWeekHighlight={true}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Hours Input - Only show if date is selected */}
          {selectedDate && (
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-xs">Hours Worked</Label>
              <div className="relative [&>div]:relative">
                <Clock className="absolute left-3 top-[18px] -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <HoursInput
                  value={hoursInput}
                  onChange={handleHoursChange}
                  onValidationChange={handleHoursValidation}
                  className="pl-10 h-9"
                  placeholder="8:30 or 8.5"
                  data-testid="hours-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Button - Only show if date is selected */}
        {selectedDate && (
          <Button
            type="button"
            onClick={handleAddEntry}
            disabled={!selectedDate || !isHoursValid}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        )}
      </div>

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Work Entries ({entries.length})</h3>
            <p className="text-xs text-muted-foreground">
              Total: {totalHours.toFixed(2)}h
            </p>
          </div>

          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-md border">
                <div className="flex-1">
                  <p className="font-medium text-xs">
                    {format(new Date(entry.work_date), 'EEE, MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.hours_worked} hours
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEntry(entry.id)}
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-3 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting} size="sm">
          Cancel
        </Button>

        <Button
          onClick={handleFormSubmit}
          disabled={entries.length === 0 || isSubmitting}
          size="sm"
        >
          {isSubmitting ? 'Saving...' : `Save ${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`}
        </Button>
      </div>
    </div>
  )
}