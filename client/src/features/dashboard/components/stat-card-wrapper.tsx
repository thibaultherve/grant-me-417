import { HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'muted';

const badgeClasses: Record<BadgeVariant, string> = {
  info: 'bg-info-light text-info',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  muted: 'bg-muted text-muted-foreground',
};

export type IconVariant = 'info' | 'success' | 'warning' | 'danger';

const iconBgClasses: Record<IconVariant, string> = {
  info: 'bg-info-light',
  success: 'bg-success-light',
  warning: 'bg-warning-light',
  danger: 'bg-danger-light',
};

const iconColorClasses: Record<IconVariant, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

interface StatCardWrapperProps {
  icon: LucideIcon;
  iconVariant: IconVariant;
  title: string;
  tooltip: string;
  badge: string;
  badgeVariant: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function StatCardWrapper({
  icon: Icon,
  iconVariant,
  title,
  tooltip,
  badge,
  badgeVariant,
  className,
  children,
}: StatCardWrapperProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg shadow-xs p-5 flex flex-col gap-3 h-[185px]',
        className,
      )}
    >
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Icon box */}
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              iconBgClasses[iconVariant],
            )}
          >
            <Icon className={cn('w-4 h-4', iconColorClasses[iconVariant])} />
          </div>
          {/* Title + tooltip */}
          <span className="text-sm font-semibold text-foreground leading-none">
            {title}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="focus:outline-none" tabIndex={-1}>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Badge */}
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap',
            badgeClasses[badgeVariant],
          )}
        >
          {badge}
        </span>
      </div>

      {/* Card-specific content */}
      {children}
    </div>
  );
}
