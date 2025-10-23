import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarWithHours } from './calendar-with-hours'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDays, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

import { HoursInput } from './hours-input'
import type { WeekWorkEntryFormData, DaysIncluded } from '../schemas'

// Import utility functions
import {
  getWeekHoursData,
  createDailyEntriesFromTotal,
  createDailyEntriesFromWeekHours,
  createDaysIncludedFromWeekHours,
  countSelectedDays,
  calculateTotalFromEntries,
  type DailyEntry
} from '../utils/week-calculations'
import {
  isWeekComplete,
  isDateDisabled,
  canToggleDay,
  shouldShowDayToggleWarning
} from '../utils/week-validation'
import { getWeekRange, DAY_LABELS } from '../utils/date-helpers'

interface ByWeekFormProps {
  employerId: string
  hoursByDate: { [date: string]: number }
  onSubmit: (data: WeekWorkEntryFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

// DailyEntry type is now imported from week-calculations
// DAY_LABELS constant is now imported from date-helpers

export function ByWeekForm({
  employerId,
  hoursByDate,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ByWeekFormProps) {
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [totalWeeklyHours, setTotalWeeklyHours] = useState('')
  const [totalDecimalHours, setTotalDecimalHours] = useState(0)
  const [isInWeekMode, setIsInWeekMode] = useState(true)
  const [isTotalHoursValid, setIsTotalHoursValid] = useState(false)
  
  // Days selection state
  const [daysIncluded, setDaysIncluded] = useState<DaysIncluded>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  })

  // Daily entries state
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([])
  const isPrefillingRef = useRef(false)
  const lastPrefilledValueRef = useRef<string | null>(null)

  // Form validation is handled through the schema in the onSubmit handler
  // getWeekHoursData is now imported from week-calculations utils

  // Pre-fill form when a week with existing data is selected
  useEffect(() => {
    if (!selectedWeekDate) return

    const { weekHours, totalHours } = getWeekHoursData(selectedWeekDate, hoursByDate)

    // Only pre-fill if there are hours for this week
    if (totalHours > 0) {
      // Set prefilling flag to prevent handleTotalHoursChange from switching back to week mode
      isPrefillingRef.current = true

      // IMPORTANT: Set to day mode FIRST to prevent equal distribution calculation
      setIsInWeekMode(false)

      // Create daily entries with actual hours using utility function
      const newEntries = createDailyEntriesFromWeekHours(selectedWeekDate, weekHours)
      setDailyEntries(newEntries)

      // Update days_included based on which days have hours using utility function
      const newDaysIncluded = createDaysIncludedFromWeekHours(weekHours)
      setDaysIncluded(newDaysIncluded)

      // Set total weekly hours LAST
      lastPrefilledValueRef.current = totalHours.toString()
      setTotalWeeklyHours(totalHours.toString())
      setTotalDecimalHours(totalHours)
    } else {
      // Reset to default values if no data exists
      setTotalWeeklyHours('')
      setTotalDecimalHours(0)
      setDaysIncluded({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      })
      setIsInWeekMode(true)
    }
  }, [selectedWeekDate, hoursByDate])

  // Handle total hours change
  const handleTotalHoursChange = (value: string, decimal: number) => {
    // Check if this is still the prefilled value (multiple calls with same value)
    const isStillPrefilledValue = lastPrefilledValueRef.current === value

    // Save the current prefilling state before resetting
    const wasPrefilling = isPrefillingRef.current

    // Only reset the flag if the value actually changed from the prefilled value
    if (isPrefillingRef.current && !isStillPrefilledValue) {
      isPrefillingRef.current = false
      lastPrefilledValueRef.current = null
    }

    setTotalWeeklyHours(value)
    setTotalDecimalHours(decimal)

    // Only switch back to week mode if user is manually changing (not during prefill)
    if (!isInWeekMode && value && !wasPrefilling && !isStillPrefilledValue) {
      setIsInWeekMode(true)
    }
  }

  // Handle total hours validation
  const handleTotalHoursValidation = (isValid: boolean) => {
    setIsTotalHoursValid(isValid)
  }

  // Calculate daily hours when total or days change
  useEffect(() => {
    // Skip if we're currently prefilling
    if (isPrefillingRef.current) {
      return
    }

    if (!selectedWeekDate) {
      return
    }

    // If totalWeeklyHours is empty string, don't do anything yet
    if (totalWeeklyHours === '') {
      return
    }

    // If total is 0, reset all entries to 0 (allows user to clear hours)
    // This works in BOTH week mode and day mode
    // Don't modify daysIncluded here to avoid infinite loop
    if (totalDecimalHours === 0) {
      // Create entries with 0 hours for currently selected days
      const resetEntries = createDailyEntriesFromTotal(
        selectedWeekDate,
        0,
        daysIncluded,
        true
      )
      setDailyEntries(resetEntries)

      // Switch to week mode when resetting
      setIsInWeekMode(true)
      return
    }

    // Only do automatic distribution in week mode
    if (!isInWeekMode) {
      return
    }

    const selectedDaysCount = countSelectedDays(daysIncluded)
    if (selectedDaysCount === 0) {
      return
    }

    // Auto-check Saturday/Sunday if needed to respect 24h/day limit
    const minDaysNeeded = Math.ceil(totalDecimalHours / 24)
    if (minDaysNeeded > selectedDaysCount) {
      const newDaysIncluded = { ...daysIncluded }

      // Add Saturday first if needed
      if (!newDaysIncluded.saturday && minDaysNeeded > selectedDaysCount) {
        newDaysIncluded.saturday = true
      }

      // Add Sunday if still needed
      const countWithSaturday = countSelectedDays(newDaysIncluded)
      if (!newDaysIncluded.sunday && minDaysNeeded > countWithSaturday) {
        newDaysIncluded.sunday = true
      }

      // Update daysIncluded - this will trigger the effect again
      setDaysIncluded(newDaysIncluded)
      return
    }

    // Create daily entries using utility function
    const newEntries = createDailyEntriesFromTotal(
      selectedWeekDate,
      totalDecimalHours,
      daysIncluded,
      true // isCalculated = true
    )

    setDailyEntries(newEntries)
  }, [selectedWeekDate, totalDecimalHours, totalWeeklyHours, daysIncluded, isInWeekMode])

  // Handle day checkbox change
  const handleDayChange = (day: keyof DaysIncluded, checked: boolean) => {
    // Use validation utility to check if day can be toggled
    if (!canToggleDay(daysIncluded, day, totalDecimalHours)) {
      return
    }

    setDaysIncluded(prev => ({ ...prev, [day]: checked }))
  }

  // isWeekComplete, isDateDisabled, and getWeekRange are now imported from utility files

  // Submit form
  const handleFormSubmit = () => {
    if (!selectedWeekDate) return

    // Allow submission even with 0 hours - the hook will handle deletions
    // No need to filter out zero entries here, the backend will handle it
    const formData: WeekWorkEntryFormData = {
      employer_id: employerId,
      week_date: format(selectedWeekDate, 'yyyy-MM-dd'),
      total_weekly_hours: totalDecimalHours.toString(),
      days_included: daysIncluded
    }

    onSubmit(formData)
  }

  // Use utility functions for calculations
  const selectedDaysCount = countSelectedDays(daysIncluded)
  const totalCalculatedHours = calculateTotalFromEntries(dailyEntries, daysIncluded)

  return (
    <div className="space-y-3">
      {/* Mode Description */}
      <p className="text-xs text-muted-foreground italic mb-2">
        Automatic: Total hours split equally across selected days
      </p>

      {/* Week Selection and Total Hours */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Week Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="week-picker" className="text-xs">Select Week</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-9',
                  !selectedWeekDate && 'text-muted-foreground'
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {selectedWeekDate
                  ? getWeekRange(selectedWeekDate)
                  : 'Select week'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarWithHours
                mode="single"
                selected={selectedWeekDate}
                onSelect={(date: Date | undefined) => {
                  setSelectedWeekDate(date)
                  setIsCalendarOpen(false)
                }}
                disabled={isDateDisabled}
                hoursByDate={hoursByDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedWeekDate && !isWeekComplete(selectedWeekDate) && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              This week is not yet complete
            </p>
          )}
        </div>

        {/* Total Weekly Hours - Only show if week is selected */}
        {selectedWeekDate && (
          <div className="space-y-2">
            <Label htmlFor="total-hours" className="text-xs">Total Weekly Hours</Label>
            <div className="relative [&>div]:relative">
              <Clock className="absolute left-3 top-[18px] -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <HoursInput
                value={totalWeeklyHours}
                onChange={handleTotalHoursChange}
                onValidationChange={handleTotalHoursValidation}
                className="pl-10 h-9"
                placeholder="8:30 or 8.5"
                maxHours={168}
                data-testid="total-hours-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Breakdown */}
      {selectedWeekDate && totalWeeklyHours && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-medium">Daily Breakdown</h3>

          <div className="space-y-2">
            {dailyEntries.map((entry) => {
              const isIncluded = daysIncluded[entry.day]
              const displayDate = new Date(entry.date)

              // Use validation utility to check if day can be toggled
              const canUncheck = canToggleDay(daysIncluded, entry.day, totalDecimalHours)

              return (
                <div
                  key={entry.day}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-md border',
                    isIncluded ? 'bg-background' : 'bg-muted/30'
                  )}
                >
                  <Checkbox
                    checked={isIncluded}
                    onCheckedChange={(checked) => handleDayChange(entry.day, checked as boolean)}
                    disabled={isIncluded && !canUncheck}
                    className="flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-xs',
                      !isIncluded && 'text-muted-foreground'
                    )}>
                      {DAY_LABELS[entry.day]}
                    </p>
                    <p className={cn(
                      'text-xs',
                      !isIncluded && 'text-muted-foreground'
                    )}>
                      {format(displayDate, 'MMM d')}
                    </p>
                  </div>

                  <div className="w-20">
                    <HoursInput
                      value={isIncluded ? entry.hours : '0'}
                      onChange={() => {}}
                      disabled={true}
                      placeholder="0"
                      className={cn(
                        'text-center text-xs h-8',
                        entry.isCalculated && isIncluded && 'bg-primary/5 border-primary/20'
                      )}
                    />
                  </div>

                  <div className="w-8 text-xs text-muted-foreground text-right">
                    {isIncluded ? 'hrs' : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-2.5 bg-muted/50 rounded-md border">
            <div className="flex justify-between text-xs">
              <span>Selected days: {selectedDaysCount}</span>
              <span>Total: {totalCalculatedHours.toFixed(2)}h</span>
            </div>
            {shouldShowDayToggleWarning(daysIncluded, totalDecimalHours) && (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Some days can't be unchecked (would exceed 24h/day)
              </p>
            )}
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
          disabled={!selectedWeekDate || selectedDaysCount === 0 || isSubmitting || !isTotalHoursValid}
          size="sm"
        >
          {isSubmitting ? 'Saving...' : `Save Week Hours`}
        </Button>
      </div>
    </div>
  )
}