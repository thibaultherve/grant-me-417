import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, label, icon: Icon, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
          variant === 'default' && 'bg-muted text-foreground',
          variant === 'success' && 'bg-success/10 text-success border border-success/20',
          variant === 'warning' && 'bg-warning/10 text-warning border border-warning/20',
          variant === 'info' && 'bg-primary/10 text-primary border border-primary/20',
          className
        )}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
