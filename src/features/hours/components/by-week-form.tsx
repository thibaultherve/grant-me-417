import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarWithHours } from './calendar-with-hours'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDays, Clock, AlertCircle } from 'lucide-react'
import { format, startOfWeek, addDays, isAfter } from 'date-fns'
import { cn } from '@/lib/utils'

import { HoursInput } from './hours-input'
import type { WeekWorkEntryFormData, DaysIncluded } from '../schemas'

interface ByWeekFormProps {
  employerId: string
  hoursByDate: { [date: string]: number }
  onSubmit: (data: WeekWorkEntryFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

interface DailyEntry {
  day: keyof DaysIncluded
  date: string
  hours: string
  decimalHours: number
  isCalculated: boolean
}

const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
} as const

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

  // Helper function to get hours for a specific week from hoursByDate
  const getWeekHoursData = useCallback((weekDate: Date) => {
    const mondayDate = startOfWeek(weekDate, { weekStartsOn: 1 })
    const weekHours: { [day: string]: number } = {}
    let totalHours = 0

    // Check each day of the week
    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(mondayDate, i)
      const dateKey = format(dayDate, 'yyyy-MM-dd')
      const hours = hoursByDate[dateKey] || 0

      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      weekHours[dayNames[i]] = hours
      totalHours += hours
    }

    return { weekHours, totalHours }
  }, [hoursByDate])

  // Pre-fill form when a week with existing data is selected
  useEffect(() => {
    if (!selectedWeekDate) return

    const { weekHours, totalHours } = getWeekHoursData(selectedWeekDate)

    // Only pre-fill if there are hours for this week
    if (totalHours > 0) {
      // Set prefilling flag to prevent handleTotalHoursChange from switching back to week mode
      isPrefillingRef.current = true

      // IMPORTANT: Set to day mode FIRST to prevent equal distribution calculation
      setIsInWeekMode(false)

      // Create daily entries with actual hours BEFORE updating total
      const mondayDate = startOfWeek(selectedWeekDate, { weekStartsOn: 1 })
      const newEntries: DailyEntry[] = Object.keys(dayLabels).map((day, index) => {
        const dayKey = day as keyof DaysIncluded
        const dayDate = addDays(mondayDate, index)
        const hours = weekHours[day] || 0

        return {
          day: dayKey,
          date: format(dayDate, 'yyyy-MM-dd'),
          hours: hours.toString(),
          decimalHours: hours,
          isCalculated: false // Not calculated, but pre-filled from existing data
        }
      })

      setDailyEntries(newEntries)

      // Update days_included based on which days have hours
      const newDaysIncluded: DaysIncluded = {
        monday: weekHours.monday > 0,
        tuesday: weekHours.tuesday > 0,
        wednesday: weekHours.wednesday > 0,
        thursday: weekHours.thursday > 0,
        friday: weekHours.friday > 0,
        saturday: weekHours.saturday > 0,
        sunday: weekHours.sunday > 0,
      }
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
  }, [selectedWeekDate, hoursByDate, getWeekHoursData])

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
  const handleTotalHoursValidation = (isValid: boolean, errorMessage: string | null) => {
    setIsTotalHoursValid(isValid)
  }

  // Calculate daily hours when total or days change
  useEffect(() => {
    // Skip if we're currently prefilling
    if (isPrefillingRef.current) {
      return
    }

    if (!selectedWeekDate || !totalDecimalHours || !isInWeekMode) {
      return
    }

    if (totalDecimalHours <= 0) {
      return
    }

    const mondayDate = startOfWeek(selectedWeekDate, { weekStartsOn: 1 })
    const selectedDayKeys = Object.keys(daysIncluded).filter(
      day => daysIncluded[day as keyof DaysIncluded]
    ) as (keyof DaysIncluded)[]

    if (selectedDayKeys.length === 0) return

    const hoursPerDay = Math.round((totalDecimalHours / selectedDayKeys.length) * 100) / 100

    const newEntries: DailyEntry[] = Object.keys(dayLabels).map((day, index) => {
      const dayKey = day as keyof DaysIncluded
      const dayDate = addDays(mondayDate, index)
      const isSelected = daysIncluded[dayKey]
      
      return {
        day: dayKey,
        date: format(dayDate, 'yyyy-MM-dd'),
        hours: isSelected ? hoursPerDay.toString() : '0',
        decimalHours: isSelected ? hoursPerDay : 0,
        isCalculated: isSelected && isInWeekMode
      }
    })

    setDailyEntries(newEntries)
  }, [selectedWeekDate, totalDecimalHours, daysIncluded, isInWeekMode])

  // Handle day checkbox change
  const handleDayChange = (day: keyof DaysIncluded, checked: boolean) => {
    // Si on essaie de décocher, vérifier que ça ne dépasse pas 24h/jour
    if (!checked && totalDecimalHours) {
      const currentSelectedDays = Object.values(daysIncluded).filter(Boolean).length
      const newSelectedDays = currentSelectedDays - 1
      
      if (newSelectedDays > 0) {
        const hoursPerDay = totalDecimalHours / newSelectedDays
        if (hoursPerDay > 24) {
          // Ne pas permettre de décocher ce jour car ça dépasserait 24h/jour
          return
        }
      }
    }
    
    setDaysIncluded(prev => ({ ...prev, [day]: checked }))
  }



  // Check if week is complete (at least Friday has passed)
  const isWeekComplete = (date: Date) => {
    const today = new Date()
    const fridayOfWeek = addDays(startOfWeek(date, { weekStartsOn: 1 }), 4) // Friday
    return today >= fridayOfWeek
  }

  // Disable future dates and incomplete weeks
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    // Disable future dates
    if (isAfter(date, today)) return true
    
    // Disable incomplete weeks
    return !isWeekComplete(date)
  }

  // Format week range
  const getWeekRange = (date: Date) => {
    const monday = startOfWeek(date, { weekStartsOn: 1 })
    const sunday = addDays(monday, 6)
    return `${format(monday, 'MMM d')} - ${format(sunday, 'MMM d, yyyy')}`
  }

  // Submit form
  const handleFormSubmit = () => {
    if (!selectedWeekDate) return

    const validEntries = dailyEntries.filter(entry => 
      daysIncluded[entry.day] && entry.decimalHours > 0
    )

    if (validEntries.length === 0) return

    const formData: WeekWorkEntryFormData = {
      employer_id: employerId,
      week_date: format(selectedWeekDate, 'yyyy-MM-dd'),
      total_weekly_hours: totalDecimalHours.toString(),
      days_included: daysIncluded
    }

    onSubmit(formData)
  }

  const selectedDaysCount = Object.values(daysIncluded).filter(Boolean).length
  const totalCalculatedHours = dailyEntries
    .filter(entry => daysIncluded[entry.day])
    .reduce((sum, entry) => sum + entry.decimalHours, 0)

  return (
    <div className="space-y-4">
      {/* Week Selection and Total Hours */}
      <div className="space-y-3">
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
                  ? `Week of ${getWeekRange(selectedWeekDate)}`
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
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
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

              // Vérifier si on peut décocher ce jour sans dépasser 24h/jour
              const currentSelectedDays = Object.values(daysIncluded).filter(Boolean).length
              const canUncheck = !isIncluded || currentSelectedDays <= 1 || !totalDecimalHours ||
                (totalDecimalHours / (currentSelectedDays - 1)) <= 24

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
                      {dayLabels[entry.day]}
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
            {selectedDaysCount > 1 && totalDecimalHours && totalDecimalHours / (selectedDaysCount - 1) > 24 && (
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