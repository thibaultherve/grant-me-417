import type { PostcodeBadgeData } from '@regranted/shared';
import {
  Fence,
  Flame,
  Globe,
  Sun,
  TreePalm,
  Wind,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export type ZoneKey =
  | 'northern'
  | 'remote'
  | 'regional'
  | 'bushfire'
  | 'weather'
  | 'anywhere';

const ZONE_CONFIG: Record<
  ZoneKey,
  { icon: LucideIcon; bg: string; label: string }
> = {
  northern: {
    icon: TreePalm,
    bg: 'bg-badge-northern',
    label: 'Northern Australia',
  },
  remote: {
    icon: Sun,
    bg: 'bg-badge-remote',
    label: 'Remote & Very Remote',
  },
  regional: {
    icon: Fence,
    bg: 'bg-badge-regional',
    label: 'Regional Australia',
  },
  bushfire: {
    icon: Flame,
    bg: 'bg-badge-bushfire',
    label: 'Bushfire-Affected Areas',
  },
  weather: {
    icon: Wind,
    bg: 'bg-badge-disaster',
    label: 'Weather-Affected Areas',
  },
  anywhere: {
    icon: Globe,
    bg: 'bg-badge-anywhere',
    label: 'Anywhere in Australia',
  },
};

interface ZoneBadgeProps {
  zone: ZoneKey;
  size?: 'sm' | 'md';
  className?: string;
}

export function ZoneBadge({ zone, size = 'md', className }: ZoneBadgeProps) {
  const config = ZONE_CONFIG[zone];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-md flex items-center justify-center shadow-sm shrink-0',
        size === 'sm' ? 'w-5.5 h-5.5' : 'w-7 h-7',
        config.bg,
        className,
      )}
      title={config.label}
    >
      <Icon
        className={cn('text-white', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')}
      />
    </div>
  );
}

export const ZONE_FLAGS: { flag: keyof PostcodeBadgeData; zone: ZoneKey }[] = [
  { flag: 'isNorthernAustralia', zone: 'northern' },
  { flag: 'isRemoteVeryRemote', zone: 'remote' },
  { flag: 'isRegionalAustralia', zone: 'regional' },
  { flag: 'isBushfireDeclared', zone: 'bushfire' },
  { flag: 'isNaturalDisasterDeclared', zone: 'weather' },
];
