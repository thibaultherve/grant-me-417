import { useState, useEffect } from 'react'
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
  const [totalWeeklyHours, setTotalWeeklyHours] = useState('39')
  const [totalDecimalHours, setTotalDecimalHours] = useState(39)
  const [isInWeekMode, setIsInWeekMode] = useState(true)
  const [isTotalHoursValid, setIsTotalHoursValid] = useState(true)
  
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

  // Form validation is handled through the schema in the onSubmit handler

  // Handle total hours change
  const handleTotalHoursChange = (value: string, decimal: number) => {
    setTotalWeeklyHours(value)
    setTotalDecimalHours(decimal)
    
    if (!isInWeekMode && value) {
      setIsInWeekMode(true)
    }
  }

  // Handle total hours validation
  const handleTotalHoursValidation = (isValid: boolean, errorMessage: string | null) => {
    setIsTotalHoursValid(isValid)
  }

  // Calculate daily hours when total or days change
  useEffect(() => {
    if (!selectedWeekDate || !totalDecimalHours || !isInWeekMode) return

    if (totalDecimalHours <= 0) return

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
    <div className="space-y-6">
      {/* Week Selection and Total Hours */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Weekly Hours Entry</h3>
          </div>

          {/* Week Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="week-picker">Select Week</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
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

          {/* Total Weekly Hours */}
          <div className="space-y-2">
            <Label htmlFor="total-hours">Total Weekly Hours</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <HoursInput
                value={totalWeeklyHours}
                onChange={handleTotalHoursChange}
                onValidationChange={handleTotalHoursValidation}
                className="pl-10"
                placeholder="40:00 or 40.0"
                maxHours={168}
                data-testid="total-hours-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      {selectedWeekDate && totalWeeklyHours && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Daily Breakdown</h3>
            </div>

            <div className="space-y-3">
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
                      'flex items-center gap-4 p-3 rounded-lg border',
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
                        'font-medium text-sm',
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

                    <div className="w-24">
                      <HoursInput
                        value={isIncluded ? entry.hours : '0'}
                        onChange={() => {}}
                        disabled={true}
                        placeholder="0"
                        className={cn(
                          'text-center text-sm',
                          entry.isCalculated && isIncluded && 'bg-primary/5 border-primary/20'
                        )}
                      />
                    </div>

                    <div className="w-10 text-xs text-muted-foreground text-right">
                      {isIncluded ? 'hrs' : '—'}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Selected days: {selectedDaysCount}</span>
                <span>Total calculated: {totalCalculatedHours.toFixed(2)}h</span>
              </div>
              {selectedDaysCount > 1 && totalDecimalHours && totalDecimalHours / (selectedDaysCount - 1) > 24 && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Some days can't be unchecked (would exceed 24h/day)
                </p>
              )}
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
          disabled={!selectedWeekDate || selectedDaysCount === 0 || isSubmitting || !isTotalHoursValid}
        >
          {isSubmitting ? 'Saving...' : `Save Week Hours`}
        </Button>
      </div>
    </div>
  )
}