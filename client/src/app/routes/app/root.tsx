import { Outlet } from 'react-router';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { VisaProvider } from '@/features/visas/hooks/use-visa-context';
import { PageHeaderProvider } from '@/hooks/use-page-header';
import { ProtectedRoute } from '@/lib/auth';

const AppRoot = () => {
  return (
    <VisaProvider>
      <PageHeaderProvider>
        <DashboardLayout>
          <Outlet />
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

export default AppRoot;
