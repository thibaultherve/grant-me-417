import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarWithHours } from './calendar-with-hours'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDays, Plus, X, Clock } from 'lucide-react'
import { format, isAfter } from 'date-fns'
import { cn } from '@/lib/utils'

import { HoursInput } from './hours-input'
import type { MultipleWorkEntriesFormData } from '../schemas'

interface ByDayFormProps {
  employerId: string
  hoursByDate: { [date: string]: number }
  onSubmit: (data: MultipleWorkEntriesFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

interface WorkEntry {
  id: string
  work_date: string
  hours_worked: string
  decimal_hours: number
}

export function ByDayForm({ employerId, hoursByDate, onSubmit, onCancel, isSubmitting = false }: ByDayFormProps) {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [hoursInput, setHoursInput] = useState('')
  const [decimalHours, setDecimalHours] = useState(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isHoursValid, setIsHoursValid] = useState(true)
  const [hoursErrorMessage, setHoursErrorMessage] = useState<string | null>(null)

  // Form validation is handled manually for better UX in this case

  // Handle hours input change
  const handleHoursChange = (value: string, decimal: number) => {
    setHoursInput(value)
    setDecimalHours(decimal)
  }

  // Handle hours validation change
  const handleHoursValidation = (isValid: boolean, errorMessage: string | null) => {
    setIsHoursValid(isValid)
    setHoursErrorMessage(errorMessage)
  }

  // Add a new work entry
  const handleAddEntry = () => {
    if (!selectedDate || !isHoursValid) return

    const dateString = format(selectedDate, 'yyyy-MM-dd')
    const newEntry: WorkEntry = {
      id: `entry-${Date.now()}`,
      work_date: dateString,
      hours_worked: decimalHours.toString(), // Store as decimal string for consistency
      decimal_hours: decimalHours
    }

    // Check if date already exists
    const existingIndex = entries.findIndex(entry => entry.work_date === dateString)
    if (existingIndex >= 0) {
      // Replace existing entry
      setEntries(prev => prev.map((entry, index) => 
        index === existingIndex ? newEntry : entry
      ))
    } else {
      // Add new entry
      setEntries(prev => [...prev, newEntry].sort((a, b) => a.work_date.localeCompare(b.work_date)))
    }

    // Reset inputs
    setSelectedDate(undefined)
    setHoursInput('')
    setDecimalHours(0)
    setIsCalendarOpen(false)
  }

  // Remove an entry
  const handleRemoveEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId))
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

  // Disable future dates
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return isAfter(date, today)
  }

  return (
    <div className="space-y-6">
      {/* Date and Hours Input */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Add Work Entry</h3>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date-picker">Work Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
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

          {/* Hours Input */}
          <div className="space-y-2">
            <Label htmlFor="hours">Hours Worked</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <HoursInput
                value={hoursInput}
                onChange={handleHoursChange}
                onValidationChange={handleHoursValidation}
                className="pl-10"
                placeholder="8:30 or 8.5"
                data-testid="hours-input"
              />
            </div>
          </div>

          {/* Add Button */}
          <Button 
            type="button" 
            onClick={handleAddEntry}
            disabled={!selectedDate || !isHoursValid}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* Entries List */}
      {entries.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Work Entries ({entries.length})</h3>
              <p className="text-sm text-muted-foreground">
                Total: {entries.reduce((sum, entry) => {
                  const hours = parseFloat(entry.hours_worked) || 0
                  return sum + hours
                }, 0).toFixed(2)}h
              </p>
            </div>

            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {format(new Date(entry.work_date), 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.hours_worked} hours
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        
        <Button 
          onClick={handleFormSubmit}
          disabled={entries.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : `Save ${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`}
        </Button>
      </div>
    </div>
  )
}