import { 
  Table, 
  TableBody, 
  TableCell, 
 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Building2, CheckCircle, XCircle } from 'lucide-react';

import { HoursPagination } from './hours-pagination';
import { SortableTableHead } from './sortable-table-head';
import type { HourEntryWithEmployer, SortOptions, SortField, SortOrder, HoursResponse } from '../types';

interface HoursTableProps {
  data: HoursResponse | null;
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortOptions: SortOptions;
  setSortOptions: (options: SortOptions) => void;
  limit: number;
}

export const HoursTable = ({
  data,
  isLoading,
  error,
  currentPage,
  setCurrentPage,
  sortOptions,
  setSortOptions,
  limit,
}: HoursTableProps) => {
  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortOptions({ field, order });
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Card>
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
      <Card>
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
      <Card>
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    field="work_date"
                    currentSort={sortOptions}
                    onSortChange={handleSortChange}
                    className="w-[120px]"
                  >
                    Date
                  </SortableTableHead>
                  <SortableTableHead
                    field="employer_name"
                    currentSort={sortOptions}
                    onSortChange={handleSortChange}
                  >
                    Employer
                  </SortableTableHead>
                  <SortableTableHead
                    field="industry"
                    currentSort={sortOptions}
                    onSortChange={handleSortChange}
                    className="w-[120px]"
                  >
                    Industry
                  </SortableTableHead>
                  <SortableTableHead
                    field="hours"
                    currentSort={sortOptions}
                    onSortChange={handleSortChange}
                    className="w-[80px] text-right"
                  >
                    Hours
                  </SortableTableHead>
                  <SortableTableHead
                    field="is_eligible"
                    currentSort={sortOptions}
                    onSortChange={handleSortChange}
                    className="w-[100px] text-center"
                  >
                    Eligible
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((entry: HourEntryWithEmployer) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
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
                        <span className="font-mono font-medium">
                          {formatHours(entry.hours)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.is_eligible ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1} to{' '}
            {Math.min(currentPage * limit, data.total)} of {data.total} entries
          </p>
          <HoursPagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};