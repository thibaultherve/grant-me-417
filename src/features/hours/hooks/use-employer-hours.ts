import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface EmployerHours {
  [date: string]: number // Total hours for that date
}

interface UseEmployerHoursParams {
  employerId: string
  enabled?: boolean
}

interface UseEmployerHoursReturn {
  hoursByDate: EmployerHours
  isLoading: boolean
  error: string | null
  totalHours: number
  totalEntries: number
}

/**
 * Hook to fetch ALL hours worked for a specific employer
 * Loads all work entries for the employer at once for optimal performance
 */
export function useEmployerHours({ 
  employerId, 
  enabled = true 
}: UseEmployerHoursParams): UseEmployerHoursReturn {
  const [hoursByDate, setHoursByDate] = useState<EmployerHours>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalHours, setTotalHours] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)

  useEffect(() => {
    if (!enabled || !employerId) {
      setHoursByDate({})
      setTotalHours(0)
      setTotalEntries(0)
      return
    }

    const fetchEmployerHours = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Query ALL work_entries for this employer (no date restrictions)
        const { data, error: queryError } = await supabase
          .from('work_entries')
          .select('work_date, hours')
          .eq('employer_id', employerId)
          .order('work_date', { ascending: false })

        if (queryError) {
          throw new Error(queryError.message)
        }

        // Group by date and sum hours
        const hoursMap: EmployerHours = {}
        let totalHoursSum = 0
        let entriesCount = 0

        data?.forEach((entry) => {
          const dateKey = entry.work_date
          const hours = parseFloat(entry.hours) || 0
          hoursMap[dateKey] = (hoursMap[dateKey] || 0) + hours
          totalHoursSum += hours
          entriesCount++
        })

        setHoursByDate(hoursMap)
        setTotalHours(totalHoursSum)
        setTotalEntries(entriesCount)
      } catch (err) {
        console.error('❌ Error fetching employer hours:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch employer hours')
        setHoursByDate({})
        setTotalHours(0)
        setTotalEntries(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployerHours()
  }, [employerId, enabled])

  return {
    hoursByDate,
    isLoading,
    error,
    totalHours,
    totalEntries
  }
}