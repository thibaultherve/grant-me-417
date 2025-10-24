import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { handleError, getErrorMessage } from '@/lib/error-handler'
import type { Employer, CreateEmployerInput } from '../types'
import { toast } from 'sonner'

export function useEmployers() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setEmployers(data || [])
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch employers')
      setError(message)
      handleError(err, {
        consolePrefix: 'Error fetching employers',
        fallbackMessage: 'Failed to load employers'
      })
    } finally {
      setLoading(false)
    }
  }

  const addEmployer = async (input: CreateEmployerInput) => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .insert([{
          name: input.name,
          industry: input.industry,
          postcode: input.postcode || null,
          is_eligible: input.is_eligible ?? true
        }])
        .select()
        .single()

      if (error) throw error

      // Update local state immediately (optimistic update)
      setEmployers(prev => [data, ...prev])
      toast.success('Employer added successfully')
      return { success: true, data }
    } catch (err) {
      return handleError(err, {
        consolePrefix: 'Error adding employer',
        fallbackMessage: 'Failed to add employer'
      })
    }
  }

  const updateEmployer = async (id: string, input: CreateEmployerInput) => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .update({
          name: input.name,
          industry: input.industry,
          postcode: input.postcode || null,
          is_eligible: input.is_eligible ?? true
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state immediately (optimistic update)
      setEmployers(prev => prev.map(emp => emp.id === id ? data : emp))
      toast.success('Employer updated successfully')
      return { success: true, data }
    } catch (err) {
      return handleError(err, {
        consolePrefix: 'Error updating employer',
        fallbackMessage: 'Failed to update employer'
      })
    }
  }

  const deleteEmployer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employers')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state immediately (optimistic update)
      setEmployers(prev => prev.filter(emp => emp.id !== id))
      toast.success('Employer deleted successfully')
      return { success: true }
    } catch (err) {
      return handleError(err, {
        consolePrefix: 'Error deleting employer',
        fallbackMessage: 'Failed to delete employer'
      })
    }
  }

  // Simple useEffect - just fetch data on mount
  useEffect(() => {
    fetchEmployers()
  }, [])

  return {
    employers,
    loading,
    error,
    addEmployer,
    updateEmployer,
    deleteEmployer,
    refetch: fetchEmployers
  }
}