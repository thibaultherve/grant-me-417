import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Home,
  Building2,
  CalendarClock,
  FileText,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: paths.app.dashboard.path, icon: Home },
  { name: 'Employers', href: paths.app.employers.path, icon: Building2 },
  { name: 'Hours', href: paths.app.hours.path, icon: CalendarClock },
  { name: 'Visas', href: paths.app.visas.path, icon: FileText },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      // Navigate first with replace to avoid ProtectedRoute redirect
      navigate(paths.home.path, { replace: true });
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="flex justify-around items-center px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 min-w-[60px] h-16 px-3 py-2 text-xs rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="leading-none truncate max-w-full">{item.name}</span>
              </Link>
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
            <DropdownMenuContent align="center" side="top" className="mb-2 min-w-48">
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
                <Link to={paths.app.profile.path} className="w-full cursor-pointer">
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
      <aside className={`hidden md:fixed md:inset-y-0 md:flex md:flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        <div className="flex min-h-0 flex-1 flex-col border-r bg-background">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center justify-between px-4">
              {!sidebarCollapsed && (
                <h1 className="text-xl font-bold transition-opacity duration-300">
                  Grant Me 417
                </h1>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="ml-auto"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      sidebarCollapsed ? '' : 'mr-3'
                    }`} />
                    {!sidebarCollapsed && (
                      <span className="transition-opacity duration-300">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
              {/* Profile link for desktop */}
              <Link
                to={paths.app.profile.path}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  location.pathname === paths.app.profile.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? 'Profile' : ''}
              >
                <User className={`h-5 w-5 flex-shrink-0 ${
                  sidebarCollapsed ? '' : 'mr-3'
                }`} />
                {!sidebarCollapsed && (
                  <span className="transition-opacity duration-300">
                    Profile
                  </span>
                )}
              </Link>
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t p-4">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
      }`}>
        <main className="flex-1 pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};