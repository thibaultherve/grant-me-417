import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import type { UserVisa } from '../types'

interface VisaContextValue {
  visas: UserVisa[]
  currentVisa: UserVisa | null
  loading: boolean
  error: string | null
  setCurrentVisa: (visa: UserVisa) => void
  refreshVisas: () => Promise<void>
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

  useEffect(() => {
    fetchVisas()
  }, [user])

  return (
    <VisaContext.Provider
      value={{
        visas,
        currentVisa,
        loading,
        error,
        setCurrentVisa,
        refreshVisas: fetchVisas
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