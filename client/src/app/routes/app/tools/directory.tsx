import { ErrorBoundary } from '@/components/shared/error-boundary';
import {
  useDirectory,
  useFavoritePostcodes,
  useLastUpdate,
  useToggleFavorite,
} from '@/features/directory/api/use-directory';
import { ChangeHistorySidebar } from '@/features/directory/components/change-history-sidebar';
import { DirectoryFilters } from '@/features/directory/components/directory-filters';
import { DirectoryTable } from '@/features/directory/components/directory-table';
import { VisaTypeTabs } from '@/features/directory/components/visa-type-tabs';
import { useDirectoryFilters } from '@/features/directory/hooks/use-directory-filters';
import { usePageHeader } from '@/hooks/use-page-header';

export const DirectoryRoute = () => {
  const {
    filters,
    setSearch,
    toggleState,
    toggleZone,
    setVisaType,
    toggleFavorites,
    setPage,
    toggleSort,
    resetFilters,
  } = useDirectoryFilters();

  const { data: directory, isLoading } = useDirectory(filters);
  const { data: lastUpdate } = useLastUpdate(filters.visaType);
  const toggleFavorite = useToggleFavorite();

  const { data: favorites } = useFavoritePostcodes();

  usePageHeader({
    description:
      'Browse all Australian postcodes and their WHV eligibility zones.',
  });

  return (
    <ErrorBoundary>
      <div className="space-y-5">
        {/* Visa type tabs */}
        <VisaTypeTabs value={filters.visaType} onChange={setVisaType} />

        {/* Filters */}
        <DirectoryFilters
          filters={filters}
          favoritesCount={favorites?.length}
          onSearchChange={setSearch}
          onToggleState={toggleState}
          onToggleZone={toggleZone}
          onToggleFavorites={toggleFavorites}
          onResetFilters={resetFilters}
        />

        {/* Directory table + Change history sidebar */}
        <div className="flex gap-5 items-start">
          <div className="min-w-0 flex-1">
            <DirectoryTable
              data={directory?.data ?? []}
              total={directory?.total ?? 0}
              page={directory?.page ?? filters.page}
              totalPages={directory?.totalPages ?? 0}
              sort={filters.sort}
              isLoading={isLoading}
              lastUpdateDate={lastUpdate?.lastUpdateDate ?? undefined}
              sourceUrl={lastUpdate?.sourceUrl ?? undefined}
              onToggleFavorite={(postcode) => toggleFavorite.mutate(postcode)}
              onPageChange={setPage}
              onToggleSort={toggleSort}
            />
          </div>

          {/* Change history sidebar — key resets internal page state on visa switch */}
          <ChangeHistorySidebar
            key={filters.visaType}
            visaType={filters.visaType}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};
