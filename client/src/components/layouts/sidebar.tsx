import {
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Hexagon,
  LayoutDashboard,
  LogOut,
  Plane,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, NavLink } from 'react-router';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { paths } from '@/config/paths';
import { useLogout, useUser } from '@/lib/auth';
import { useSidebar } from '@/hooks/use-sidebar';

const navigation = [
  { name: 'Dashboard', href: paths.app.dashboard.path, icon: LayoutDashboard },
  { name: 'Hours', href: paths.app.hours.path, icon: CalendarClock },
  { name: 'Employers', href: paths.app.employers.path, icon: Building2 },
  { name: 'Visas', href: paths.app.visas.path, icon: Plane },
];

function getInitials(email?: string): string {
  if (!email) return 'U';
  const parts = email.split('@')[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const { data: user } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);

  // Close dropdown when viewport switches to mobile (< 768px)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setProfileOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const logoutMutation = useLogout({
    onSuccess: () => {
      toast.success('Signed out successfully');
      window.location.href = '/';
    },
  });

  const initials = getInitials(user?.email);

  return (
    <aside
      className={`group flex flex-col fixed inset-y-0 left-0 z-40 bg-[#f5f5f5] transition-[width] duration-300 ease-in-out w-0 md:border-r md:border-[#d1d4db] ${
        isCollapsed ? 'md:w-16' : 'md:w-64'
      }`}
    >
      {/* Inner wrapper — clips content during width transition to prevent flash */}
      <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div
        className={`flex h-14 flex-shrink-0 items-center ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-2'}`}
      >
        {/* Logo icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-[10px] bg-[#e1e7fd] flex items-center justify-center">
          <Hexagon className="w-4 h-4 text-[#364050]" />
        </div>
        {/* Brand name */}
        {!isCollapsed && (
          <span className="text-sm font-semibold text-[#1d293d] leading-none whitespace-nowrap overflow-hidden transition-all duration-300">
            Get Granted 417
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-3 overflow-hidden">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === paths.app.dashboard.path}
              className={({ isActive }) =>
                `flex items-center rounded-lg h-11 transition-colors duration-150 ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                } ${
                  isActive
                    ? 'bg-[#e1e7fd] text-[#1d293d] font-medium'
                    : 'text-[#1d293d] hover:bg-[#e1e7fd]/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#1d293d]' : 'text-[#6c727e]'}`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm leading-none whitespace-nowrap overflow-hidden transition-all duration-300">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer with profile dropdown */}
      <div className="flex-shrink-0 p-2">
        <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center rounded-lg transition-colors h-12 ${
                isCollapsed ? 'justify-center px-0' : 'gap-2 px-2'
              } ${profileOpen ? 'bg-[#e1e7fd]' : 'bg-[#f5f5f5] hover:bg-[#ebebeb]'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1d293d] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-[#6c727e] truncate">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-[#6c727e] flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isCollapsed ? 'right' : 'top'}
            align="center"
            sideOffset={8}
            className={cn(
              'min-w-48 rounded-[10px] border-[#d1d4db] bg-[#fafafa]',
              isCollapsed
                ? 'shadow-[4px_0_12px_-2px_rgba(0,0,0,0.10),2px_0_6px_-1px_rgba(0,0,0,0.06)]'
                : 'shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.10),0_-2px_6px_-1px_rgba(0,0,0,0.06)]',
            )}
          >
            <DropdownMenuItem asChild>
              <Link to={paths.app.profile.path} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4 text-destructive" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      </div>

      {/* Collapse toggle — outside overflow wrapper so it's never clipped */}
      <button
        onClick={toggle}
        className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-white rounded-full hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 border border-[#d1d4db] cursor-pointer shadow-sm"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-[#6c727e]" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-[#6c727e]" />
        )}
      </button>
    </aside>
  );
}
