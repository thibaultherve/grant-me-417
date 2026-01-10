import * as React from 'react';

import { cn } from '@/lib/utils';

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'accent';
}

export const InfoCard = React.forwardRef<HTMLDivElement, InfoCardProps>(
  (
    { className, title, description, children, variant = 'accent', ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-6',
          variant === 'accent' && 'bg-cream border border-border',
          variant === 'default' && 'bg-card border border-border',
          className,
        )}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        {children}
      </div>
    );
  },
);

InfoCard.displayName = 'InfoCard';
