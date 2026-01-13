import { useQueryClient } from '@tanstack/react-query';
import {
  Home,
  Building2,
  CalendarClock,
  Plane,
  User,
  LogOut,
} from 'lucide-react';
import React from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { paths } from '@/config/paths';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const navigation = [
  { name: 'Dashboard', href: paths.app.dashboard.path, icon: Home },
  { name: 'Hours', href: paths.app.hours.path, icon: CalendarClock },
  { name: 'Employers', href: paths.app.employers.path, icon: Building2 },
  { name: 'Visas', href: paths.app.visas.path, icon: Plane },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    try {
      // Manual fallback: clear all Supabase auth data from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });

      // Clear all React Query cache to prevent data leakage between users
      queryClient.clear();

      // Try to sign out normally, but ignore errors since we already cleared localStorage
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Ignore errors - we already cleared the session manually
      }

      // Force a page reload to ensure all state is cleared
      window.location.href = '/';

      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="flex justify-around items-center px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === paths.app.dashboard.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 min-w-[60px] h-16 px-3 py-2 text-xs rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="leading-none truncate max-w-full">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
          {/* Profile dropdown for mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex flex-col items-center justify-center gap-1 min-w-[60px] h-16 px-3 py-2 text-xs rounded-lg transition-colors ${
                  location.pathname === paths.app.profile.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <User className="h-5 w-5 flex-shrink-0" />
                <span className="leading-none">Profile</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              className="mb-2 min-w-48"
            >
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to={paths.app.profile.path}
                  className="w-full cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle size="sm" />
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-56 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-sidebar-border bg-sidebar">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-6">
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Grant Me 417
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === paths.app.dashboard.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-normal transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : 'text-muted-foreground'}`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="flex-shrink-0 border-t border-sidebar-border">
            {/* User info */}
            <div className="px-3 py-4">
              <div className="flex flex-col gap-3">
                {/* Profile link */}
                <Link
                  to={paths.app.profile.path}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-normal transition-all duration-200 ${
                    location.pathname === paths.app.profile.path
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <User
                    className={`h-5 w-5 flex-shrink-0 ${location.pathname === paths.app.profile.path ? '' : 'text-muted-foreground'}`}
                  />
                  <span>Profile</span>
                </Link>

                {/* User email */}
                <div className="px-3">
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-3">
                  <ThemeToggle size="sm" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    title="Sign out"
                    className="h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-56">
        <main className="flex-1 pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
