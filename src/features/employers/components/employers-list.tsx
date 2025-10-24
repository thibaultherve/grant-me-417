import { Building2 } from 'lucide-react'
import { EmployerCard } from './employer-card'
import type { Employer } from '../types'

interface EmployersListProps {
  employers: Employer[]
  loading: boolean
  error: string | null
  onEdit: (employer: Employer) => void
  onDelete: (id: string) => Promise<void>
}

export function EmployersList({ 
  employers, 
  loading, 
  error, 
  onEdit, 
  onDelete 
}: EmployersListProps) {
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading employers...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-destructive">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {employers.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="font-medium mb-2">No employers yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first employer to start tracking work
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {employers.map((employer) => (
            <EmployerCard 
              key={employer.id} 
              employer={employer} 
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </>
  )
}