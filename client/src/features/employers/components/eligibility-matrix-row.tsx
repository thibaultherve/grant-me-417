import type { IndustryType, PostcodeBadgeData } from '@regranted/shared';
import {
  ELIGIBLE_ZONES,
  ZONE_FLAG_MAP,
  ZONE_TYPES,
  type ZoneType,
} from '@regranted/shared';

import { IndustryChip } from '@/components/shared/industry-chip';
import { type ZoneKey } from '@/components/shared/zone-badge';
import { cn } from '@/lib/utils';

export const ZONES = ZONE_TYPES as readonly ZoneKey[];

export function isZoneActive(
  zone: ZoneType,
  suburbFlags: PostcodeBadgeData | null,
): boolean {
  if (!suburbFlags) return false;
  const flag = ZONE_FLAG_MAP[zone];
  return flag === null ? true : !!suburbFlags[flag as keyof PostcodeBadgeData];
}

function MatrixDot({
  active,
  zoneActive,
}: {
  active: boolean;
  zoneActive: boolean;
}) {
  return (
    <div
      className={cn(
        'w-2.5 h-2.5 rounded-full shrink-0',
        active
          ? 'bg-success'
          : zoneActive
            ? 'bg-muted-foreground/50'
            : 'bg-muted-foreground/20',
      )}
    />
  );
}

function MatrixCross({
  active,
  zoneActive,
}: {
  active: boolean;
  zoneActive: boolean;
}) {
  return (
    <span
      className={cn(
        'font-bold text-sm leading-none',
        active
          ? 'text-danger'
          : zoneActive
            ? 'text-muted-foreground/60'
            : 'text-muted-foreground/20',
      )}
    >
      ✖
    </span>
  );
}

interface MatrixRowProps {
  industry: IndustryType;
  index: number;
  selectedIndustry: IndustryType | null;
  suburbFlags: PostcodeBadgeData | null;
  visaType: '417' | '462';
}

export function MatrixRow({
  industry,
  index,
  selectedIndustry,
  suburbFlags,
  visaType,
}: MatrixRowProps) {
  const isSelected = selectedIndustry === industry;
  const eligibleZones = ELIGIBLE_ZONES[visaType][industry];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-3 border-l-[3px]',
        isSelected
          ? 'border-l-primary'
          : index % 2 === 0
            ? 'bg-background border-l-transparent'
            : 'bg-muted border-l-transparent',
      )}
    >
      {/* Industry badge column — compact on mobile, full on sm+ */}
      <div className="w-28 sm:w-50 shrink-0 py-1">
        <IndustryChip industry={industry} className="sm:hidden" compact />
        <IndustryChip industry={industry} className="hidden sm:inline-flex" />
      </div>

      {/* Zone cells */}
      {ZONES.map((zone) => {
        const hasRule = eligibleZones.includes(zone);
        const zoneActive = isZoneActive(zone, suburbFlags);

        return (
          <div
            key={zone}
            className="flex-1 h-7 flex items-center justify-center"
          >
            {hasRule ? (
              <MatrixDot
                active={isSelected && zoneActive}
                zoneActive={zoneActive}
              />
            ) : (
              <MatrixCross
                active={isSelected && zoneActive}
                zoneActive={zoneActive}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
