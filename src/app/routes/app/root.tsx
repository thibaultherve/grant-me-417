import { Outlet } from 'react-router';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { ProtectedRoute } from '@/lib/auth';

export const AppRoot = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
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