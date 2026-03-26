import {
  Building2,
  CalendarClock,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  Plane,
  Settings,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { paths } from '@/config/paths';
import { useLogout } from '@/lib/auth';

const navItems = [
  { name: 'Dashboard', href: paths.app.dashboard.path, icon: LayoutDashboard },
  { name: 'Hours', href: paths.app.hours.path, icon: CalendarClock },
  { name: 'Employers', href: paths.app.employers.path, icon: Building2 },
  { name: 'Visas', href: paths.app.visas.path, icon: Plane },
];

export function MobileNav() {
  const [profileOpen, setProfileOpen] = useState(false);

  // Close dropdown when viewport switches to desktop (≥ 768px)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[#f5f5f5] border-t border-[#d1d4db] h-[72px] px-2 transition-transform duration-300 ease-in-out translate-y-0 md:translate-y-full md:pointer-events-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === paths.app.dashboard.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-[70px] h-14 ${
                isActive ? '' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-[#6468f0] w-14 h-8'
                      : 'w-12 h-7'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#6c727e]'}`}
                  />
                </div>
                <span
                  className={`text-[10px] leading-none ${
                    isActive ? 'text-[#6468f0] font-semibold' : 'text-[#6c727e] font-normal'
                  }`}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        );
      })}

      {/* Profile tab */}
      <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-col items-center justify-center gap-0.5 w-[70px] h-14">
            <div
              className={`flex items-center justify-center rounded-2xl transition-colors ${
                profileOpen ? 'bg-[#6468f0] w-14 h-8' : 'w-12 h-7'
              }`}
            >
              <UserRound
                className={`w-5 h-5 ${profileOpen ? 'text-white' : 'text-[#6c727e]'}`}
              />
            </div>
            <span
              className={`flex items-center gap-0.5 text-[10px] leading-none ${
                profileOpen ? 'text-[#6468f0] font-semibold' : 'text-[#6c727e] font-normal'
              }`}
            >
              Profile
              <ChevronUp className="w-2.5 h-2.5" />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" sideOffset={8} className="min-w-48">
          <DropdownMenuItem asChild>
            <a href={paths.app.profile.path} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </a>
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
    </nav>
  );
}
