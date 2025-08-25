import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Home, 
  Building2, 
  Clock, 
  FileText, 
  User,
  LogOut 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: paths.app.dashboard.path, icon: Home },
  { name: 'Employers', href: paths.app.employers.path, icon: Building2 },
  { name: 'Work Entries', href: paths.app.workEntries.path, icon: Clock },
  { name: 'Visas', href: paths.app.visas.path, icon: FileText },
  { name: 'Profile', href: paths.app.profile.path, icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

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
          {/* Logout button for mobile */}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center gap-1 min-w-[60px] h-16 px-3 py-2 text-xs rounded-lg transition-colors text-muted-foreground hover:text-destructive hover:bg-accent"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="leading-none">Logout</span>
          </button>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-background">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold">Get Granted 417</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t p-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
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
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1 pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};