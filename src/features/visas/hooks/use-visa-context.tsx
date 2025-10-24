import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import type { UserVisa, CreateVisaInput } from '../types'

interface VisaContextValue {
  visas: UserVisa[]
  currentVisa: UserVisa | null
  loading: boolean
  error: string | null
  setCurrentVisa: (visa: UserVisa) => void
  refreshVisas: () => Promise<void>
  addVisa: (input: CreateVisaInput) => Promise<{ success: boolean; data?: UserVisa; error?: string }>
  updateVisa: (id: string, input: Partial<CreateVisaInput>) => Promise<{ success: boolean; data?: UserVisa; error?: string }>
  deleteVisa: (id: string) => Promise<{ success: boolean; error?: string }>
}

const VisaContext = createContext<VisaContextValue | undefined>(undefined)

export function VisaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [visas, setVisas] = useState<UserVisa[]>([])
  const [currentVisa, setCurrentVisaState] = useState<UserVisa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVisas = async () => {
    if (!user) {
      setVisas([])
      setCurrentVisaState(null)
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

      // Restore current visa from localStorage or select first visa
      const savedVisaId = localStorage.getItem('currentVisaId')
      if (savedVisaId && data) {
        const savedVisa = data.find(v => v.id === savedVisaId)
        setCurrentVisaState(savedVisa || data[0] || null)
      } else {
        setCurrentVisaState(data?.[0] || null)
      }
    } catch (err) {
      console.error('Error fetching visas:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch visas')
    } finally {
      setLoading(false)
    }
  }

  const setCurrentVisa = (visa: UserVisa) => {
    setCurrentVisaState(visa)
    localStorage.setItem('currentVisaId', visa.id)
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

  // Single useEffect - only refresh when user ID changes
  // Using user?.id instead of user to avoid re-fetching when user object reference changes
  // but the actual user (by ID) remains the same (e.g., on tab visibility change)
  useEffect(() => {
    fetchVisas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <VisaContext.Provider
      value={{
        visas,
        currentVisa,
        loading,
        error,
        setCurrentVisa,
        refreshVisas: fetchVisas,
        addVisa,
        updateVisa,
        deleteVisa
      }}
    >
      {children}
    </VisaContext.Provider>
  )
}

export function useVisaContext() {
  const context = useContext(VisaContext)
  if (context === undefined) {
    throw new Error('useVisaContext must be used within a VisaProvider')
  }
  return context
}