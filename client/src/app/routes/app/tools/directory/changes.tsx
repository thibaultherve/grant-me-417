import { Navigate, useParams, useSearchParams } from 'react-router';

import { ErrorBoundary } from '@/components/shared/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import { useChangeDetail } from '@/features/directory/api/use-directory';
import { ChangeDetailHeader } from '@/features/directory/components/change-detail-header';
import { ChangeDetailPostcodes } from '@/features/directory/components/change-detail-postcodes';
import { ChangeDetailSummary } from '@/features/directory/components/change-detail-summary';
import type { VisaTypeFilter } from '@/features/directory/types/directory';

export const ChangeDetailRoute = () => {
  const { date } = useParams<{ date: string }>();
  const [searchParams] = useSearchParams();

  const visaType = (
    searchParams.get('visaType') === '462' ? '462' : '417'
  ) as VisaTypeFilter;

  const { data: detail, isLoading, error } = useChangeDetail(date, visaType);

  if (isLoading) {
    return <ChangeDetailSkeleton />;
  }

  if (error) {
    return <Navigate to={paths.app.tools.directory.getHref()} replace />;
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm text-muted-foreground">
          No changes found for this date.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-5">
        <ChangeDetailHeader date={detail.date} visaType={visaType} />
        <ChangeDetailSummary
          date={detail.date}
          totalAffected={detail.totalAffected}
          sourceUrl={detail.sourceUrl}
        />
        <ChangeDetailPostcodes changes={detail.changes} />
      </div>
    </ErrorBoundary>
  );
};

function ChangeDetailSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <Skeleton className="h-9 w-96 rounded" />
      {/* Summary skeleton */}
      <Skeleton className="h-20 w-full rounded-lg" />
      {/* Postcodes skeleton */}
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
