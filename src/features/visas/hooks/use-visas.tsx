import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserVisa, CreateVisaInput } from '../types'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'

export function useVisas() {
  const { user } = useAuth()
  const [visas, setVisas] = useState<UserVisa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVisas = async () => {
    if (!user) {
      setVisas([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_visas')
        .select('*')
        .eq('user_id', user.id)
        .order('visa_type', { ascending: true })

      if (error) throw error

      setVisas(data || [])
    } catch (err) {
      console.error('Error fetching visas:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch visas')
      toast.error('Failed to load visas')
    } finally {
      setLoading(false)
    }
  }

  const addVisa = async (input: CreateVisaInput) => {
    if (!user) {
      const message = 'User must be authenticated to add a visa'
      toast.error(message)
      return { success: false, error: message }
    }

    try {
      const { data, error } = await supabase
        .from('user_visas')
        .insert([{
          user_id: user.id,
          visa_type: input.visa_type,
          arrival_date: input.arrival_date,
          days_required: input.days_required
        }])
        .select()
        .single()

      if (error) throw error

      // Update local state immediately (optimistic update)
      setVisas(prev => [...prev, data])
      toast.success('Visa added successfully')
      return { success: true, data }
    } catch (err) {
      console.error('Error adding visa:', err)
      const message = err instanceof Error ? err.message : 'Failed to add visa'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const updateVisa = async (id: string, input: Partial<CreateVisaInput>) => {
    try {
      const { data, error } = await supabase
        .from('user_visas')
        .update({
          visa_type: input.visa_type,
          arrival_date: input.arrival_date,
          days_required: input.days_required
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state immediately (optimistic update)
      setVisas(prev => prev.map(visa => visa.id === id ? data : visa))
      toast.success('Visa updated successfully')
      return { success: true, data }
    } catch (err) {
      console.error('Error updating visa:', err)
      const message = err instanceof Error ? err.message : 'Failed to update visa'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const deleteVisa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_visas')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state immediately (optimistic update)
      setVisas(prev => prev.filter(visa => visa.id !== id))
      toast.success('Visa deleted successfully')
      return { success: true }
    } catch (err) {
      console.error('Error deleting visa:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete visa'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Simple useEffect - just fetch data on mount or when user changes
  useEffect(() => {
    fetchVisas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return {
    visas,
    loading,
    error,
    addVisa,
    updateVisa,
    deleteVisa,
    refetch: fetchVisas
  }
}
