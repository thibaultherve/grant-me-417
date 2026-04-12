import { Outlet } from 'react-router';

import { DashboardLayout } from '@/app/layouts/dashboard-layout';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { VisaProvider } from '@/features/visas/hooks/use-visa-context';
import { PageHeaderProvider } from '@/hooks/use-page-header';
import { ProtectedRoute } from '@/lib/auth';

const AppRoot = () => {
  return (
    <VisaProvider>
      <PageHeaderProvider>
        <DashboardLayout>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </DashboardLayout>
      </PageHeaderProvider>
    </VisaProvider>
  );
};

export const ProtectedAppRoot = () => {
  return (
    <ProtectedRoute>
      <AppRoot />
    </ProtectedRoute>
  );
};
