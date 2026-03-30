import { useState } from 'react';

import { CircleHelp, TriangleAlert } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { IndustryType, PostcodeBadgeData } from '@regranted/shared';
import { ELIGIBLE_ZONES, ZONE_TYPES, ZONE_FLAG_MAP, type ZoneType } from '@regranted/shared';

import {
  EligibilityStatusBadge,
  getEligibilityStatus,
} from './eligibility-status-badge';
import { IndustryChip } from './industry-chip';
import { ZoneBadge, type ZoneKey } from './zone-badge';

// ── Zone / flag mapping ──────────────────────────────────────────────────────

const ZONES = ZONE_TYPES as readonly ZoneKey[];

// Matrix row order matches Pencil design
const INDUSTRY_ORDER: IndustryType[] = [
  'hospitality_and_tourism',
  'plant_and_animal_cultivation',
  'fishing_and_pearling',
  'tree_farming_and_felling',
  'mining',
  'construction',
  'bushfire_recovery_work',
  'weather_recovery_work',
  'critical_covid19_work',
  'other',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isZoneActive(zone: ZoneType, suburbFlags: PostcodeBadgeData | null): boolean {
  if (!suburbFlags) return false;
  const flag = ZONE_FLAG_MAP[zone];
  return flag === null ? true : !!suburbFlags[flag as keyof PostcodeBadgeData];
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface EligibilitySwitchProps {
  mode: 'automatic' | 'manual';
  onChange: (mode: 'automatic' | 'manual') => void;
}

function EligibilitySwitch({ mode, onChange }: EligibilitySwitchProps) {
  const isAuto = mode === 'automatic';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAuto}
      onClick={() => onChange(isAuto ? 'manual' : 'automatic')}
      className="flex items-center gap-1.5 shrink-0"
    >
      {/* Track */}
      <div
        className={cn(
          'relative w-8 h-4.5 rounded-full transition-colors shrink-0',
          isAuto ? 'bg-primary' : 'bg-muted border border-border',
        )}
      >
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-0.75 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-150',
            isAuto ? 'translate-x-4.25' : 'translate-x-0.75',
          )}
        />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground select-none">
        {isAuto ? 'Automatic' : 'Manual'}
      </span>
    </button>
  );
}

function MatrixDot({ active, zoneActive }: { active: boolean; zoneActive: boolean }) {
  return (
    <div
      className={cn(
        'w-2.5 h-2.5 rounded-full shrink-0',
        active ? 'bg-success' : zoneActive ? 'bg-muted-foreground/50' : 'bg-muted-foreground/20',
      )}
    />
  );
}

function MatrixCross({ active, zoneActive }: { active: boolean; zoneActive: boolean }) {
  return (
    <span
      className={cn(
        'font-bold text-sm leading-none',
        active ? 'text-danger' : zoneActive ? 'text-muted-foreground/60' : 'text-muted-foreground/20',
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

function MatrixRow({
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
              <MatrixDot active={isSelected && zoneActive} zoneActive={zoneActive} />
            ) : (
              <MatrixCross active={isSelected && zoneActive} zoneActive={zoneActive} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface EligibilityCheckCardProps {
  mode: 'automatic' | 'manual';
  onModeChange: (mode: 'automatic' | 'manual') => void;
  /** null = no status yet */
  isEligible: boolean | null;
  isChecking: boolean;
  selectedIndustry: IndustryType | null;
  suburbFlags: PostcodeBadgeData | null;
  visaType: '417' | '462';
  onManualEligibilityChange: (eligible: boolean) => void;
}

export function EligibilityCheckCard({
  mode,
  onModeChange,
  isEligible,
  isChecking,
  selectedIndustry,
  suburbFlags,
  visaType,
  onManualEligibilityChange,
}: EligibilityCheckCardProps) {
  const isManual = mode === 'manual';
  const status = getEligibilityStatus(isChecking, isManual ? isEligible : isEligible);

  const [selectOpen, setSelectOpen] = useState(false);

  const handleModeChange = (newMode: 'automatic' | 'manual') => {
    onModeChange(newMode);
    if (newMode === 'manual') setSelectOpen(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      {/* Header Row */}
      <div className="flex items-center gap-1.5">
        {/* Left: title + help */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[13px] font-semibold text-foreground">
            Eligibility Check
          </span>
          <CircleHelp
            className="w-3.5 h-3.5 text-muted-foreground shrink-0"
            aria-label={`Based on WHV ${visaType} visa rules: industry × work zone eligibility`}
          />
        </div>

        {/* Center: status (auto badge or manual select) */}
        <div className="flex-1 flex items-center justify-center">
          {isManual ? (
            <Select
              value={isEligible === null ? undefined : isEligible ? 'eligible' : 'not-eligible'}
              onValueChange={(v) => onManualEligibilityChange(v === 'eligible')}
              open={selectOpen}
              onOpenChange={setSelectOpen}
            >
              <SelectTrigger className="h-auto min-h-0 bg-transparent dark:bg-transparent border-0 shadow-none px-0 py-px gap-1 text-[11px] font-medium focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60">
                {isEligible === null ? (
                  <span className="text-muted-foreground">Select status...</span>
                ) : isEligible ? (
                  <span className="flex items-center gap-1.5 text-success font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block shrink-0" />
                    Eligible
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-danger font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block shrink-0" />
                    Not Eligible
                  </span>
                )}
              </SelectTrigger>
              <SelectContent align="center">
                <SelectItem value="eligible" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                    Eligible
                  </span>
                </SelectItem>
                <SelectItem value="not-eligible" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" />
                    Not Eligible
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <EligibilityStatusBadge status={status} />
          )}
        </div>

        {/* Right: auto/manual switch */}
        <EligibilitySwitch mode={mode} onChange={handleModeChange} />
      </div>

      {/* Warning banner (manual mode only) */}
      {isManual && isEligible !== null && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-lg px-3 py-2',
            isEligible ? 'bg-warning-light' : 'bg-danger-light',
          )}
        >
          <TriangleAlert
            className={cn(
              'w-4 h-4 shrink-0 mt-px',
              isEligible ? 'text-warning-dark' : 'text-danger-dark',
            )}
          />
          <p
            className={cn(
              'text-xs font-medium leading-snug',
              isEligible ? 'text-warning-dark' : 'text-danger-dark',
            )}
          >
            {isEligible
              ? 'You have manually set this employer as eligible.'
              : 'You have manually set this employer as not eligible.'}
          </p>
        </div>
      )}

      {/* Matrix — horizontally scrollable on small screens */}
      <div
        className={cn(
          'rounded-lg border border-border overflow-x-auto transition-opacity',
          isManual ? 'opacity-40' : 'opacity-100',
        )}
      >
        <div>
          {/* Zone header */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-muted">
            {/* Spacer for industry column — matches MatrixRow industry column width */}
            <div className="w-28 sm:w-50 shrink-0" />
            {ZONES.map((zone) => {
              const zoneActive = isZoneActive(zone, suburbFlags);
              return (
                <div
                  key={zone}
                  className="flex-1 flex items-center justify-center"
                >
                  <ZoneBadge
                    zone={zone}
                    className={cn(
                      'transition-opacity',
                      suburbFlags && !zoneActive && 'opacity-25',
                    )}
                  />
                </div>
              );
            })}
          </div>

          {/* Industry rows */}
          {INDUSTRY_ORDER.map((industry, index) => (
            <MatrixRow
              key={industry}
              industry={industry}
              index={index}
              selectedIndustry={selectedIndustry}
              suburbFlags={suburbFlags}
              visaType={visaType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
