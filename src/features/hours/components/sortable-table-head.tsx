import { TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortField, SortOrder, SortOptions } from '../types';

export type SortableTableHeadProps = {
  field: SortField;
  children: React.ReactNode;
  currentSort?: SortOptions;
  onSortChange: (field: SortField, order: SortOrder) => void;
  className?: string;
};

export const SortableTableHead = ({
  field,
  children,
  currentSort,
  onSortChange,
  className = '',
}: SortableTableHeadProps) => {
  const isCurrentField = currentSort?.field === field;
  const currentOrder = isCurrentField ? currentSort?.order : undefined;

  const handleSort = () => {
    if (!isCurrentField) {
      // If not currently sorted by this field, start with ascending
      onSortChange(field, 'asc');
    } else {
      // If already sorted by this field, toggle the order
      const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(field, newOrder);
    }
  };

  const getSortIcon = () => {
    if (!isCurrentField) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    if (currentOrder === 'asc') {
      return <ArrowUp className="h-4 w-4 text-foreground" />;
    }
    
    return <ArrowDown className="h-4 w-4 text-foreground" />;
  };

  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={handleSort}
        className="flex items-center gap-2 h-auto p-0 font-medium hover:bg-transparent"
      >
        {children}
        {getSortIcon()}
      </Button>
    </TableHead>
  );
};