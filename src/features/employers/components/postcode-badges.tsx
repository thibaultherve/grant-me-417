import { cn } from '@/lib/utils';

import type { Postcode } from '../types/postcode';

// Badge colors for each flag type
export const BADGE_CONFIG = {
  is_regional_australia: {
    color: 'bg-green-400',
    label: 'Regional Australia',
  },
  is_northern_australia: {
    color: 'bg-violet-400',
    label: 'Northern Australia',
  },
  is_remote_very_remote: {
    color: 'bg-rose-400',
    label: 'Remote and Very Remote Australia',
  },
  is_bushfire_declared: {
    color: 'bg-orange-400',
    label: 'Bushfire declared areas',
  },
  is_natural_disaster_declared: {
    color: 'bg-blue-400',
    label: 'Natural disaster declared areas',
  },
} as const;

interface PostcodeBadgesProps {
  postcode: Postcode;
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
