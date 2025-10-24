import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { getWeekDates, formatDateKey } from '../utils/date-helpers'
import type { MultipleWorkEntriesFormData, WeekWorkEntryFormData } from '../schemas'

export function useAddHours() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  // Helper to check if work entries already exist for given dates
  const checkExistingEntries = async (employerId: string, dates: string[]) => {
    try {
      const { data, error } = await supabase
        .from('work_entries')
        .select('work_date, hours')
        .eq('employer_id', employerId)
        .in('work_date', dates)

      if (error) throw error

      return data || []
    } catch (err) {
      console.error('Error checking existing entries:', err)
      return []
    }
  }

  // Add multiple work entries (By Day mode)
  const addWorkEntries = async (formData: MultipleWorkEntriesFormData) => {
    try {
      setIsSubmitting(true)

      if (!user) {
        throw new Error('User not authenticated')
      }

      const dates = formData.entries.map(entry => entry.work_date)
      const existingEntries = await checkExistingEntries(formData.employer_id, dates)

      // If there are existing entries, return them for user confirmation
      if (existingEntries.length > 0) {
        // Create a map of new hours by date for easy lookup
        const newHoursMap = new Map(
          formData.entries.map(entry => [entry.work_date, parseFloat(entry.hours_worked)])
        )
        
        return { 
          success: false, 
          requiresConfirmation: true, 
          existingDates: existingEntries.map(entry => entry.work_date),
          existingEntries: existingEntries.map(entry => ({
            work_date: entry.work_date,
            oldHours: entry.hours,
            newHours: newHoursMap.get(entry.work_date) || 0
          })),
          message: `Work entries already exist for ${existingEntries.length} date(s). Do you want to overwrite them?`
        }
      }

      // Prepare entries for insertion
      const entries = formData.entries.map(entry => ({
        user_id: user.id,
        employer_id: formData.employer_id,
        work_date: entry.work_date,
        hours: parseFloat(entry.hours_worked)
      }))

      const { data, error } = await supabase
        .from('work_entries')
        .insert(entries)
        .select()

      if (error) throw error

      toast.success(`Successfully added ${entries.length} work ${entries.length === 1 ? 'entry' : 'entries'}`)
      return { success: true, data }

    } catch (err) {
      console.error('Error adding work entries:', err)
      const message = err instanceof Error ? err.message : 'Failed to add work entries'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add work entries with forced overwrite
  const addWorkEntriesWithOverwrite = async (formData: MultipleWorkEntriesFormData) => {
    try {
      setIsSubmitting(true)

      if (!user) {
        throw new Error('User not authenticated')
      }

      const dates = formData.entries.map(entry => entry.work_date)
      
      // Delete existing entries for these dates and employer
      const { error: deleteError } = await supabase
        .from('work_entries')
        .delete()
        .eq('employer_id', formData.employer_id)
        .in('work_date', dates)

      if (deleteError) throw deleteError

      // Filter out entries with 0 hours (deletions) and insert only positive hours
      const entriesToInsert = formData.entries
        .filter(entry => parseFloat(entry.hours_worked) > 0)
        .map(entry => ({
          user_id: user.id,
          employer_id: formData.employer_id,
          work_date: entry.work_date,
          hours: parseFloat(entry.hours_worked)
        }))

      let data = null
      if (entriesToInsert.length > 0) {
        const { data: insertData, error } = await supabase
          .from('work_entries')
          .insert(entriesToInsert)
          .select()

        if (error) throw error
        data = insertData
      }

      const totalEntries = formData.entries.length
      const deletedEntries = totalEntries - entriesToInsert.length
      
      let message = ''
      if (entriesToInsert.length > 0 && deletedEntries > 0) {
        message = `Successfully updated ${entriesToInsert.length} ${entriesToInsert.length === 1 ? 'entry' : 'entries'} and deleted ${deletedEntries} ${deletedEntries === 1 ? 'entry' : 'entries'}`
      } else if (entriesToInsert.length > 0) {
        message = `Successfully updated ${entriesToInsert.length} work ${entriesToInsert.length === 1 ? 'entry' : 'entries'}`
      } else {
        message = `Successfully deleted ${deletedEntries} work ${deletedEntries === 1 ? 'entry' : 'entries'}`
      }
      
      toast.success(message)
      return { success: true, data }

    } catch (err) {
      console.error('Error adding work entries with overwrite:', err)
      const message = err instanceof Error ? err.message : 'Failed to update work entries'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Convert week data to daily entries
  // Uses centralized date utilities from date-helpers.ts
  const convertWeekToDaily = (weekData: WeekWorkEntryFormData): MultipleWorkEntriesFormData => {
    const { week_date, total_weekly_hours, days_included } = weekData

    // Get all dates in the week using centralized utility
    const weekDateObjects = getWeekDates(new Date(week_date))
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

    // Map dates to {day, date} format for filtering
    const weekDates = weekDateObjects.map((dateObj, index) => ({
      day: dayNames[index],
      date: formatDateKey(dateObj)
    }))

    const selectedDays = weekDates.filter(({ day }) => days_included[day])
    const totalHours = typeof total_weekly_hours === 'number' ? total_weekly_hours : parseFloat(total_weekly_hours || '0')
    const hoursPerDay = Math.round((totalHours / selectedDays.length) * 100) / 100

    const entries = selectedDays.map(({ date }) => ({
      work_date: date,
      hours_worked: hoursPerDay.toString()
    }))

    // Don't filter out zero entries - we need them to mark days for deletion
    return {
      employer_id: weekData.employer_id,
      entries: entries
    }
  }

  // Add work entries from week mode (with deletion of unchecked days)
  const addWeekWorkEntries = async (weekData: WeekWorkEntryFormData) => {
    try {
      setIsSubmitting(true)

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get all dates in the week using centralized utilities
      const allWeekDates = getWeekDates(new Date(weekData.week_date))
      const allDatesInWeek = allWeekDates.map(dateObj => formatDateKey(dateObj))
      
      // Get selected dates (days to add/update)
      const dailyData = convertWeekToDaily(weekData)
      const selectedDates = dailyData.entries.map(entry => entry.work_date)
      
      // Get dates to delete (unchecked days)
      const datesToDelete = allDatesInWeek.filter(date => !selectedDates.includes(date))

      // Check existing entries for all dates in the week
      const existingEntries = await checkExistingEntries(weekData.employer_id, allDatesInWeek)

      // Separate existing entries into those to update vs those to delete
      const existingToUpdate = existingEntries.filter(entry => selectedDates.includes(entry.work_date))
      const existingToDelete = existingEntries.filter(entry => datesToDelete.includes(entry.work_date))
      
      // If there are existing entries to update or delete, return for confirmation
      if (existingToUpdate.length > 0 || existingToDelete.length > 0) {
        // Create a map of new hours by date for easy lookup
        const newHoursMap = new Map(
          dailyData.entries.map(entry => [entry.work_date, parseFloat(entry.hours_worked)])
        )
        
        return { 
          success: false, 
          requiresConfirmation: true, 
          existingDates: [...existingToUpdate.map(e => e.work_date), ...existingToDelete.map(e => e.work_date)],
          existingEntries: [
            // Entries to update/overwrite
            ...existingToUpdate.map(entry => ({
              work_date: entry.work_date,
              oldHours: entry.hours,
              newHours: newHoursMap.get(entry.work_date) || 0,
              action: 'update' as const
            })),
            // Entries to delete
            ...existingToDelete.map(entry => ({
              work_date: entry.work_date,
              oldHours: entry.hours,
              newHours: 0,
              action: 'delete' as const
            }))
          ],
          message: `Found existing entries for ${existingToUpdate.length + existingToDelete.length} date(s). Some will be updated, some will be deleted.`
        }
      }

      // No existing entries to worry about, just insert new ones
      const entries = dailyData.entries.map(entry => ({
        user_id: user.id,
        employer_id: weekData.employer_id,
        work_date: entry.work_date,
        hours: parseFloat(entry.hours_worked)
      }))

      const { data, error } = await supabase
        .from('work_entries')
        .insert(entries)
        .select()

      if (error) throw error

      toast.success(`Successfully added ${entries.length} work ${entries.length === 1 ? 'entry' : 'entries'}`)
      return { success: true, data }

    } catch (err) {
      console.error('Error adding week work entries:', err)
      const message = err instanceof Error ? err.message : 'Failed to add work entries'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add work entries from week mode with overwrite (including deletions)
  const addWeekWorkEntriesWithOverwrite = async (weekData: WeekWorkEntryFormData) => {
    try {
      setIsSubmitting(true)

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get all dates in the week using centralized utilities
      const allWeekDates = getWeekDates(new Date(weekData.week_date))
      const allDatesInWeek = allWeekDates.map(dateObj => formatDateKey(dateObj))

      // Get daily data for selected dates
      const dailyData = convertWeekToDaily(weekData)
      
      // Get dates to delete (unchecked days)
      // Dates to delete are handled by full week deletion above
      
      // Delete ALL existing entries for this week and employer (both selected and unselected dates)
      const { error: deleteError } = await supabase
        .from('work_entries')
        .delete()
        .eq('employer_id', weekData.employer_id)
        .in('work_date', allDatesInWeek)

      if (deleteError) throw deleteError

      // Insert only the selected days with hours > 0 (unchecked days stay deleted)
      // Filter out entries with 0 hours to avoid creating empty entries
      const entriesToInsert = dailyData.entries
        .filter(entry => parseFloat(entry.hours_worked) > 0)
        .map(entry => ({
          user_id: user.id,
          employer_id: weekData.employer_id,
          work_date: entry.work_date,
          hours: parseFloat(entry.hours_worked)
        }))

      if (entriesToInsert.length > 0) {
        const { data: _data, error } = await supabase
          .from('work_entries')
          .insert(entriesToInsert)
          .select()

        if (error) throw error
      }

      // Calculate the number of entries actually modified
      const entriesInserted = entriesToInsert.length
      const entriesDeleted = allDatesInWeek.length - entriesInserted

      toast.success(`Successfully updated week entries (${entriesInserted} added/updated, ${entriesDeleted} deleted)`)
      return { success: true, data: null }

    } catch (err) {
      console.error('Error adding week work entries with overwrite:', err)
      const message = err instanceof Error ? err.message : 'Failed to update work entries'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    addWorkEntries,
    addWorkEntriesWithOverwrite,
    addWeekWorkEntries,
    addWeekWorkEntriesWithOverwrite,
    convertWeekToDaily
  }
}