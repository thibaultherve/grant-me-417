import {
  Trees,
  Sun,
  Navigation,
  Flame,
  CloudLightning,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import type { Postcode } from '../types/postcode';
import type { PostcodeBadgeData } from '../types/suburb';

// Badge colors and icons for each flag type
const BADGE_CONFIG: Record<
  string,
  { color: string; textColor: string; label: string; icon: LucideIcon }
> = {
  is_regional_australia: {
    color: 'bg-badge-regional/15',
    textColor: 'text-badge-regional',
    label: 'Regional Australia',
    icon: Trees,
  },
  is_northern_australia: {
    color: 'bg-badge-northern/15',
    textColor: 'text-badge-northern',
    label: 'Northern Australia',
    icon: Sun,
  },
  is_remote_very_remote: {
    color: 'bg-badge-remote/15',
    textColor: 'text-badge-remote',
    label: 'Remote and Very Remote Australia',
    icon: Navigation,
  },
  is_bushfire_declared: {
    color: 'bg-badge-bushfire/15',
    textColor: 'text-badge-bushfire',
    label: 'Bushfire declared areas',
    icon: Flame,
  },
  is_natural_disaster_declared: {
    color: 'bg-badge-disaster/15',
    textColor: 'text-badge-disaster',
    label: 'Natural disaster declared areas',
    icon: CloudLightning,
  },
};

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
    .map(([key, config]) => {
      const Icon = config.icon;
      return (
        <div
          key={key}
          className={cn(
            'rounded-full flex items-center justify-center',
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
            config.color,
          )}
          title={config.label}
        >
          <Icon
            className={cn(
              size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3',
              config.textColor,
            )}
          />
        </div>
      );
    });

  if (badges.length === 0) return null;

  return <div className={cn('flex gap-1', className)}>{badges}</div>;
}
