import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

import { SortableTableHead } from './sortable-table-head';
import { HourEntryCard } from './hour-entry-card';
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

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortOptions({ field, order });
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)}h`;
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
      critical_covid19_work: 'COVID-19 Work',
      other: 'Other',
    };
    return labels[industry] || industry;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortOptions.field !== field) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return sortOptions.order === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading hours...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">
              Error loading hours: {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.data.length) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium">No hours found</p>
            <p className="text-sm text-muted-foreground">
              Start by adding your first entry to track your progress.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {data.data.map((entry: HourEntryWithEmployer) => (
          <HourEntryCard key={entry.id} entry={entry} onDelete={handleDeleteClick} />
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <Card className="border-border hidden md:block">
        <CardHeader>
          <CardTitle>Work Entries</CardTitle>
          <CardDescription>Manage and track all your work hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      field="work_date"
                      currentSort={sortOptions}
                      onSortChange={handleSortChange}
                      className="w-[120px] cursor-pointer"
                    >
                      <div className="flex items-center">
                        Date
                        <SortIcon field="work_date" />
                      </div>
                    </SortableTableHead>
                    <SortableTableHead
                      field="employer_name"
                      currentSort={sortOptions}
                      onSortChange={handleSortChange}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Employer
                        <SortIcon field="employer_name" />
                      </div>
                    </SortableTableHead>
                    <SortableTableHead
                      field="industry"
                      currentSort={sortOptions}
                      onSortChange={handleSortChange}
                      className="w-[120px] cursor-pointer"
                    >
                      <div className="flex items-center">
                        Industry
                        <SortIcon field="industry" />
                      </div>
                    </SortableTableHead>
                    <SortableTableHead
                      field="hours"
                      currentSort={sortOptions}
                      onSortChange={handleSortChange}
                      className="w-[80px] text-right cursor-pointer"
                    >
                      <div className="flex items-center justify-end">
                        Hours
                        <SortIcon field="hours" />
                      </div>
                    </SortableTableHead>
                    <SortableTableHead
                      field="is_eligible"
                      currentSort={sortOptions}
                      onSortChange={handleSortChange}
                      className="w-[100px] text-center cursor-pointer"
                    >
                      <div className="flex items-center justify-center">
                        Eligible
                        <SortIcon field="is_eligible" />
                      </div>
                    </SortableTableHead>
                    <TableCell className="w-[80px]">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((entry: HourEntryWithEmployer) => (
                    <TableRow key={entry.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(entry.work_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate max-w-[200px]">
                            {entry.employer_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getIndustryLabel(entry.industry)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatHours(entry.hours)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.is_eligible ? (
                          <Badge variant="default" className="bg-success/10 text-success border border-success/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border border-destructive/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(entry)}
                              className="text-red-600 dark:text-red-400"
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
          </div>

        </CardContent>
      </Card>

      {/* Pagination (shared between mobile and desktop) */}
      {data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
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
            <AlertDialogTitle>Delete Work Entry</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this work entry?
                </p>
                {entryToDelete && (
                  <div className="mt-3 p-3 bg-muted rounded-md space-y-1">
                    <p className="text-sm">
                      <strong>Date:</strong> {formatDate(entryToDelete.work_date)}
                    </p>
                    <p className="text-sm">
                      <strong>Employer:</strong> {entryToDelete.employer_name}
                    </p>
                    <p className="text-sm">
                      <strong>Hours:</strong> {formatHours(entryToDelete.hours)}
                    </p>
                  </div>
                )}
                <p className="mt-3 text-destructive text-sm">
                  This action cannot be undone.
                </p>
              </div>
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
