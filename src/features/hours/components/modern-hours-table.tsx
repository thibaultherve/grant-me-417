import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

import { useDeleteWorkEntry } from '../api/use-hours';
import type { HourEntryWithEmployer, SortOptions, SortField, SortOrder, HoursResponse } from '../types';

interface ModernHoursTableProps {
  data: HoursResponse | null;
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortOptions: SortOptions;
  setSortOptions: (options: SortOptions) => void;
  limit: number;
}

export const ModernHoursTable = ({
  data,
  isLoading,
  error,
  currentPage,
  setCurrentPage,
  sortOptions,
  setSortOptions,
  limit,
}: ModernHoursTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<HourEntryWithEmployer | null>(null);
  const deleteMutation = useDeleteWorkEntry();

  const handleSortChange = (field: SortField) => {
    const newOrder: SortOrder =
      sortOptions.field === field && sortOptions.order === 'asc' ? 'desc' : 'asc';
    setSortOptions({ field, order: newOrder });
    setCurrentPage(1);
  };

  const handleDeleteClick = (entry: HourEntryWithEmployer) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!entryToDelete) return;

    deleteMutation.mutate(entryToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setEntryToDelete(null);
      }
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getIndustryLabel = (industry: string) => {
    const labels: Record<string, string> = {
      plant_and_animal_cultivation: 'Agriculture',
      fishing_and_pearling: 'Fishing',
      tree_farming_and_felling: 'Forestry',
      mining: 'Mining',
      construction: 'Construction',
      hospitality_and_tourism: 'Hospitality',
      bushfire_recovery_work: 'Bushfire Recovery',
      critical_covid19_work: 'COVID-19',
      other: 'Other',
    };
    return labels[industry] || industry;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortOptions.field === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSortChange(field)}
        className="h-8 px-2 -mx-2 hover:bg-muted"
      >
        {children}
        {isActive && (
          sortOptions.order === 'asc'
            ? <ChevronUp className="ml-1 h-3 w-3" />
            : <ChevronDown className="ml-1 h-3 w-3" />
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-16">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading hours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border p-16">
        <div className="text-center space-y-2">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">
            Error loading hours: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="rounded-md border p-16">
        <div className="text-center space-y-2">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-medium">No hours found</p>
          <p className="text-sm text-muted-foreground">
            Start by adding your first entry to track your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Unified Table - Mobile First */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">
                <SortButton field="work_date">Date</SortButton>
              </TableHead>
              <TableHead className="min-w-[120px]">
                <SortButton field="employer_name">Employer</SortButton>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortButton field="industry">Industry</SortButton>
              </TableHead>
              <TableHead className="w-[60px] text-right">
                <SortButton field="hours">Hrs</SortButton>
              </TableHead>
              <TableHead className="w-[50px] text-center">
                <SortButton field="is_eligible">
                  <span className="sr-only">Eligible</span>
                  <CheckCircle className="h-4 w-4" />
                </SortButton>
              </TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((entry: HourEntryWithEmployer) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs font-medium">
                  {formatDate(entry.work_date)}
                </TableCell>
                <TableCell className="text-sm font-medium truncate">
                  {entry.employer_name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {getIndustryLabel(entry.industry)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {entry.hours}h
                </TableCell>
                <TableCell className="text-center">
                  {entry.is_eligible ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(entry)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
          <p className="text-xs text-muted-foreground">
            {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
              disabled={currentPage === data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
