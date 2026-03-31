import { ExternalLink } from 'lucide-react';

import { ErrorBoundary } from '@/components/shared/error-boundary';
import {
  useDirectory,
  useFavoritePostcodes,
  useLastUpdate,
  useToggleFavorite,
} from '@/features/directory/api/use-directory';
import { ChangeHistoryTable } from '@/features/directory/components/change-history-table';
import { DirectoryFilters } from '@/features/directory/components/directory-filters';
import { DirectoryTable } from '@/features/directory/components/directory-table';
import { VisaTypeTabs } from '@/features/directory/components/visa-type-tabs';
import { useDirectoryFilters } from '@/features/directory/hooks/use-directory-filters';
import { usePageHeader } from '@/hooks/use-page-header';

function formatLastUpdate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const DirectoryRoute = () => {
  const {
    filters,
    setSearch,
    toggleState,
    toggleZone,
    setVisaType,
    setPage,
    toggleSort,
    resetFilters,
  } = useDirectoryFilters();

  const { data: directory, isLoading } = useDirectory(filters);
  const { data: lastUpdate } = useLastUpdate(filters.visaType);
  const toggleFavorite = useToggleFavorite();

  // Prefetch favorites for optimistic toggle
  useFavoritePostcodes();

  usePageHeader({
    description:
      'Browse all Australian postcodes and their WHV eligibility zones.',
  });

  return (
    <ErrorBoundary>
      <div className="space-y-5">
        {/* Visa type tabs */}
        <VisaTypeTabs value={filters.visaType} onChange={setVisaType} />

        {/* Source info */}
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Last update: {formatLastUpdate(lastUpdate?.lastUpdateDate)}
            </span>
            {lastUpdate?.sourceUrl && (
              <>
                <span>&middot;</span>
                <a
                  href={lastUpdate.sourceUrl}
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
          <span className="text-[11px] text-muted-foreground/60">
            No postcode eligibility changes detected after this date.
          </span>
        </div>

        {/* Filters */}
        <DirectoryFilters
          filters={filters}
          totalCount={directory?.total}
          onSearchChange={setSearch}
          onToggleState={toggleState}
          onToggleZone={toggleZone}
          onResetFilters={resetFilters}
        />

        {/* Directory table */}
        <DirectoryTable
          data={directory?.data ?? []}
          total={directory?.total ?? 0}
          page={directory?.page ?? filters.page}
          totalPages={directory?.totalPages ?? 0}
          sort={filters.sort}
          isLoading={isLoading}
          onToggleFavorite={(postcode) => toggleFavorite.mutate(postcode)}
          onPageChange={setPage}
          onToggleSort={toggleSort}
        />

        {/* Change history — key resets internal page state on visa switch */}
        <ChangeHistoryTable
          key={filters.visaType}
          visaType={filters.visaType}
        />

      </div>
    </ErrorBoundary>
  );
};
