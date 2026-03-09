import {
  Utensils,
  Sprout,
  Fish,
  TreePine,
  Pickaxe,
  HardHat,
  Flame,
  Wind,
  HeartPulse,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { IndustryType } from '@get-granted/shared';
import { INDUSTRY_SHORT_LABELS } from '../constants';

interface IndustryConfig {
  icon: LucideIcon;
  label: string;
  /** Tailwind bg class for the 20×20 icon square */
  iconBg: string;
  /** Tailwind border class for the card outline */
  border: string;
}

const INDUSTRY_CONFIG: Record<IndustryType, IndustryConfig> = {
  hospitality_and_tourism: {
    icon: Utensils,
    label: 'Hospitality & Tourism',
    iconBg: 'bg-industry-hospitality',
    border: 'border-industry-hospitality',
  },
  plant_and_animal_cultivation: {
    icon: Sprout,
    label: 'Plant & Animal Cultivation',
    iconBg: 'bg-badge-regional',
    border: 'border-badge-regional',
  },
  fishing_and_pearling: {
    icon: Fish,
    label: 'Fishing & Pearling',
    iconBg: 'bg-industry-fishing',
    border: 'border-industry-fishing',
  },
  tree_farming_and_felling: {
    icon: TreePine,
    label: 'Tree Farming & Felling',
    iconBg: 'bg-industry-tree-farming',
    border: 'border-industry-tree-farming',
  },
  mining: {
    icon: Pickaxe,
    label: 'Mining',
    iconBg: 'bg-industry-mining',
    border: 'border-industry-mining',
  },
  construction: {
    icon: HardHat,
    label: 'Construction',
    iconBg: 'bg-industry-construction',
    border: 'border-industry-construction',
  },
  bushfire_recovery_work: {
    icon: Flame,
    label: 'Bushfire Recovery Work',
    iconBg: 'bg-badge-bushfire',
    border: 'border-badge-bushfire',
  },
  weather_recovery_work: {
    icon: Wind,
    label: 'Weather Recovery Work',
    iconBg: 'bg-badge-disaster',
    border: 'border-badge-disaster',
  },
  critical_covid19_work: {
    icon: HeartPulse,
    label: 'Critical COVID-19 Work',
    iconBg: 'bg-industry-covid',
    border: 'border-industry-covid',
  },
  other: {
    icon: Briefcase,
    label: 'Other',
    iconBg: 'bg-industry-other',
    border: 'border-industry-other',
  },
};

interface IndustryBadgeProps {
  industry: IndustryType;
  /** Use shorter label (for compact contexts like mobile matrix rows) */
  compact?: boolean;
  className?: string;
}

export function IndustryBadge({ industry, compact, className }: IndustryBadgeProps) {
  const config = INDUSTRY_CONFIG[industry];
  const Icon = config.icon;
  const label = compact ? INDUSTRY_SHORT_LABELS[industry] : config.label;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 h-[30px] px-2.5 rounded-lg bg-card border-[1.5px]',
        config.border,
        className,
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded flex items-center justify-center shrink-0',
          config.iconBg,
        )}
      >
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-xs font-medium text-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
