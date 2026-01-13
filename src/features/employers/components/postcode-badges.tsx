import { cn } from '@/lib/utils';

import type { Postcode } from '../types/postcode';
import type { PostcodeBadgeData } from '../types/suburb';

// Badge colors for each flag type - using theme CSS variables
const BADGE_CONFIG = {
  is_regional_australia: {
    color: 'bg-chart-1',
    label: 'Regional Australia',
  },
  is_northern_australia: {
    color: 'bg-chart-2',
    label: 'Northern Australia',
  },
  is_remote_very_remote: {
    color: 'bg-destructive',
    label: 'Remote and Very Remote Australia',
  },
  is_bushfire_declared: {
    color: 'bg-chart-4',
    label: 'Bushfire declared areas',
  },
  is_natural_disaster_declared: {
    color: 'bg-chart-5',
    label: 'Natural disaster declared areas',
  },
} as const;

interface PostcodeBadgesProps {
  postcode: Postcode | PostcodeBadgeData;
  size?: 'sm' | 'md';
  className?: string;
}

export function PostcodeBadges({
  postcode,
  size = 'md',
  className,
}: PostcodeBadgesProps) {
  const badges = Object.entries(BADGE_CONFIG)
    .filter(([key]) => postcode[key as keyof typeof postcode] === true)
    .map(([key, config]) => (
      <div
        key={key}
        className={cn(
          'rounded-full',
          size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
          config.color,
        )}
        title={config.label}
      />
    ));

  if (badges.length === 0) return null;

  return <div className={cn('flex gap-1.5', className)}>{badges}</div>;
}
