import React from 'react';

import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { useSidebar } from '@/hooks/use-sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileNav />

      {/* Main content */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out pb-18 md:pb-0 ${
          isCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <PageBreadcrumb />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
