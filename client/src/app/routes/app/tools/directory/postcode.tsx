import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { ErrorBoundary } from '@/components/shared/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFavoritePostcodes,
  usePostcodeDetail,
  useToggleFavorite,
} from '@/features/directory/api/use-directory';
import { IndustryEligibilityCard } from '@/features/directory/components/industry-eligibility-card';
import { LocationMapCard } from '@/features/directory/components/location-map-card';
import { PostcodeDetailHeader } from '@/features/directory/components/postcode-detail-header';
import { SuburbListCard } from '@/features/directory/components/suburb-list-card';
import { ZonesHistoryCard } from '@/features/directory/components/zones-history-card';
import type { VisaTypeFilter } from '@/features/directory/types/directory';

export const PostcodeDetailRoute = () => {
  const { postcode, suburbId } = useParams<{
    postcode: string;
    suburbId?: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const visaType = (
    searchParams.get('visaType') === '462' ? '462' : '417'
  ) as VisaTypeFilter;
  const setVisaType = useCallback(
    (value: VisaTypeFilter) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === '417') {
          next.delete('visaType');
        } else {
          next.set('visaType', value);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const { data: detail, isLoading, error } = usePostcodeDetail(postcode);
  const { data: favorites } = useFavoritePostcodes();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = favorites?.some((f) => f.postcode === postcode) ?? false;

  if (isLoading) {
    return <PostcodeDetailSkeleton />;
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm text-muted-foreground">
          {error ? 'Failed to load postcode details.' : 'Postcode not found.'}
        </p>
      </div>
    );
  }

  const stateCode = detail.suburbs[0]?.stateCode ?? 'NSW';
  const eligibilityFlags =
    visaType === '417' ? detail.eligibility417 : detail.eligibility462;
  const selectedSuburb = suburbId
    ? detail.suburbs.find((s) => String(s.id) === suburbId)
    : null;

  return (
    <ErrorBoundary>
      <div className="space-y-5">
        <PostcodeDetailHeader
          postcode={detail.postcode}
          stateCode={stateCode}
          suburbs={detail.suburbs}
          selectedSuburbId={suburbId}
          isFavorite={isFavorite}
          visaType={visaType}
          onToggleFavorite={() => toggleFavorite.mutate(detail.postcode)}
          onVisaTypeChange={setVisaType}
        />

        {/* Row 1: Suburbs + Eligibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SuburbListCard
            postcode={detail.postcode}
            suburbs={detail.suburbs}
            selectedSuburbId={suburbId}
            eligibilityFlags={eligibilityFlags}
          />
          <IndustryEligibilityCard
            eligibilityFlags={eligibilityFlags}
            visaType={visaType}
          />
        </div>

        {/* Row 2: Map + History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ErrorBoundary>
            <LocationMapCard
              postcode={detail.postcode}
              stateCode={stateCode}
              selectedSuburbName={selectedSuburb?.suburbName}
            />
          </ErrorBoundary>
          <ZonesHistoryCard history={detail.history} visaType={visaType} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

function PostcodeDetailSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-9 w-72 rounded" />
        <Skeleton className="h-4 w-96 rounded" />
        <Skeleton className="h-8 w-44 rounded" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}
