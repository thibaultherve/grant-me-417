import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useDeleteHours() {
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteWorkEntry = async (entryId: string) => {
    try {
      setIsDeleting(true)

      const { error } = await supabase
        .from('work_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error

      toast.success('Work entry deleted successfully')
      return { success: true }

    } catch (err) {
      console.error('Error deleting work entry:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete work entry'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    isDeleting,
    deleteWorkEntry
  }
}
