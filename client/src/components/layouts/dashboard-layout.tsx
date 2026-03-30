import React from 'react';
import { Link } from 'react-router';

import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { usePageHeaderSlot } from '@/hooks/use-page-header';
import { paths } from '@/config/paths';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { useSidebar } from '@/hooks/use-sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isCollapsed } = useSidebar();
  const { action: headerAction, description: headerDescription } = usePageHeaderSlot();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileNav />

      {/* Main content */}
      <div
        className={`flex flex-1 flex-col transition-[padding] duration-300 ease-in-out pb-18 md:pb-0 ${
          isCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <PageBreadcrumb />
                  {headerDescription && (
                    <p className="text-sm text-muted-foreground">{headerDescription}</p>
                  )}
                </div>
                {headerAction && <div className="shrink-0">{headerAction}</div>}
              </div>
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 mt-auto">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-xs text-muted-foreground/70 mb-3">
              ReGranted is a personal tracking tool. It does not provide legal, tax, or immigration advice. Always verify visa requirements with the{' '}
              <a
                href="https://immi.homeaffairs.gov.au"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-muted-foreground"
              >
                Australian Department of Home Affairs
              </a>.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to={paths.legal.privacy.getHref()} className="text-xs text-muted-foreground/70 hover:text-muted-foreground">
                  Privacy Policy
                </Link>
                <Link to={paths.legal.terms.getHref()} className="text-xs text-muted-foreground/70 hover:text-muted-foreground">
                  Terms of Service
                </Link>
              </div>
              <p className="text-xs text-muted-foreground/70">
                &copy; {new Date().getFullYear()} ReGranted
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
