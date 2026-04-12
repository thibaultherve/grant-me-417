import type { Visa } from '@regranted/shared';
import { Plane } from 'lucide-react';

import { VisaCard } from './visa-card';

interface VisasListProps {
  visas: Visa[];
  loading: boolean;
  error: Error | null;
  onEdit?: (visa: Visa) => void;
  onDelete: (id: string) => void;
}

export function VisasList({
  visas,
  loading,
  error,
  onEdit,
  onDelete,
}: VisasListProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading visas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-destructive">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {visas.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Plane className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="font-medium mb-2">No visas yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first visa to start tracking your progress
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {visas.length} visa{visas.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {visas.map((visa) => (
              <VisaCard
                key={visa.id}
                visa={visa}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
