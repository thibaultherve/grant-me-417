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
}

const INDUSTRY_CONFIG: Record<IndustryType, IndustryConfig> = {
  hospitality_and_tourism: {
    icon: Utensils,
    label: 'Hospitality & Tourism',
    iconBg: 'bg-industry-hospitality',
  },
  plant_and_animal_cultivation: {
    icon: Sprout,
    label: 'Plant & Animal Cultivation',
    iconBg: 'bg-industry-cultivation',
  },
  fishing_and_pearling: {
    icon: Fish,
    label: 'Fishing & Pearling',
    iconBg: 'bg-industry-fishing',
  },
  tree_farming_and_felling: {
    icon: TreePine,
    label: 'Tree Farming & Felling',
    iconBg: 'bg-industry-tree-farming',
  },
  mining: {
    icon: Pickaxe,
    label: 'Mining',
    iconBg: 'bg-industry-mining',
  },
  construction: {
    icon: HardHat,
    label: 'Construction',
    iconBg: 'bg-industry-construction',
  },
  bushfire_recovery_work: {
    icon: Flame,
    label: 'Bushfire Recovery Work',
    iconBg: 'bg-industry-bushfire',
  },
  weather_recovery_work: {
    icon: Wind,
    label: 'Weather Recovery Work',
    iconBg: 'bg-industry-weather-recovery',
  },
  critical_covid19_work: {
    icon: HeartPulse,
    label: 'Critical COVID-19 Work',
    iconBg: 'bg-industry-covid',
  },
  other: {
    icon: Briefcase,
    label: 'Other',
    iconBg: 'bg-industry-other',
  },
};

interface IndustryChipProps {
  industry: IndustryType;
  /** Use shorter label (for compact contexts like mobile matrix rows) */
  compact?: boolean;
  className?: string;
}

export function IndustryChip({ industry, compact, className }: IndustryChipProps) {
  const config = INDUSTRY_CONFIG[industry];
  const Icon = config.icon;
  const label = compact ? INDUSTRY_SHORT_LABELS[industry] : config.label;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 h-[30px] px-2.5 rounded-lg',
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
