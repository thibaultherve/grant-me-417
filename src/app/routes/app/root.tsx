import { Outlet } from 'react-router';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { ProtectedRoute } from '@/lib/auth';
import { VisaProvider } from '@/features/visas/hooks/use-visa-context';

export const AppRoot = () => {
  return (
    <VisaProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
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