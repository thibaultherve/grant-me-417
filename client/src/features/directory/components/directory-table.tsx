import type { PaginatedDirectoryItem } from '@regranted/shared';
import {
  ArrowUpDown,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router';

import { PostcodeLinkBadge } from '@/components/shared/postcode-link-badge';
import { ZoneBadge, type ZoneKey } from '@/components/shared/zone-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDateSafe } from '@/utils/date-format';

import type { SortDirection } from '../types/directory';

import { FavoriteButton } from './favorite-button';

interface DirectoryTableProps {
  data: PaginatedDirectoryItem[];
  total: number;
  page: number;
  totalPages: number;
  sort: SortDirection;
  isLoading: boolean;
  lastUpdateDate?: string;
  sourceUrl?: string;
  onToggleFavorite: (postcode: string) => void;
  onPageChange: (page: number) => void;
  onToggleSort: () => void;
}

export function DirectoryTable({
  data,
  total,
  page,
  totalPages,
  sort,
  isLoading,
  lastUpdateDate,
  sourceUrl,
  onToggleFavorite,
  onPageChange,
  onToggleSort,
}: DirectoryTableProps) {
  const navigate = useNavigate();
  const limit = totalPages > 0 ? Math.ceil(total / totalPages) : 15;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-primary" />
          Eligibility Directory
        </CardTitle>
        {lastUpdateDate && (
          <CardAction>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Last update: {formatDateSafe(lastUpdateDate)}</span>
              {sourceUrl && (
                <>
                  <span>&middot;</span>
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-10 px-2" />
              <TableHead className="px-2">
                <button
                  type="button"
                  onClick={onToggleSort}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Postcode
                  <ArrowUpDown className="w-3 h-3" />
                  {sort === 'desc' && (
                    <span className="text-[9px] font-normal">(Z-A)</span>
                  )}
                </button>
              </TableHead>
              <TableHead className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Zones
              </TableHead>
              <TableHead className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suburbs
              </TableHead>
              <TableHead className="w-8 px-2" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-2">
                      <Skeleton className="w-5 h-5 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-20 h-4 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-24 h-5 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-40 h-4 rounded" />
                    </TableCell>
                    <TableCell className="px-2">
                      <Skeleton className="w-4 h-4 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              : data.map((item) => (
                  <TableRow
                    key={item.postcode}
                    className="cursor-pointer h-7"
                    onClick={() =>
                      navigate(
                        paths.app.tools.directory.postcode.getHref(
                          item.postcode,
                        ),
                      )
                    }
                  >
                    <TableCell className="px-2">
                      <FavoriteButton
                        isFavorite={item.isFavorite}
                        onClick={() => onToggleFavorite(item.postcode)}
                      />
                    </TableCell>
                    <TableCell className="px-2">
                      <PostcodeLinkBadge
                        postcode={item.postcode}
                        stateCode={item.stateCode}
                        size="sm"
                        asLink={false}
                      />
                    </TableCell>
                    <TableCell className="px-2">
                      <div className="flex items-center gap-1">
                        {item.zones.map((zone) => (
                          <ZoneBadge
                            key={zone}
                            zone={zone as ZoneKey}
                            size="sm"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 text-[13px] text-muted-foreground max-w-70 truncate">
                      {item.suburbs.join(', ')}
                    </TableCell>
                    <TableCell className="px-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}

            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No postcodes found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {totalPages > 0 && (
        <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {start}-{end} of {total.toLocaleString()} postcodes
          </span>
          <PaginationButtons
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </CardFooter>
      )}
    </Card>
  );
}

function PaginationButtons({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = computePageNumbers(page, totalPages);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="h-7 text-xs px-2"
      >
        Previous
      </Button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-xs text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p as number)}
            className="h-7 w-7 text-xs p-0"
          >
            {p}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="h-7 text-xs px-2"
      >
        Next
      </Button>
    </div>
  );
}

function computePageNumbers(
  current: number,
  total: number,
): (number | '...')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}
