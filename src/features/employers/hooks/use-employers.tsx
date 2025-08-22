import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
      console.error('Error fetching employers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch employers')
      toast.error('Failed to load employers')
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

      setEmployers(prev => [data, ...prev])
      toast.success('Employer added successfully')
      return { success: true, data }
    } catch (err) {
      console.error('Error adding employer:', err)
      const message = err instanceof Error ? err.message : 'Failed to add employer'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const deleteEmployer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEmployers(prev => prev.filter(emp => emp.id !== id))
      toast.success('Employer deleted successfully')
      return { success: true }
    } catch (err) {
      console.error('Error deleting employer:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete employer'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  useEffect(() => {
    fetchEmployers()
  }, [])

  return {
    employers,
    loading,
    error,
    addEmployer,
    deleteEmployer,
    refetch: fetchEmployers
  }
}