import { AUSTRALIAN_STATES, ZONE_TYPES } from '@regranted/shared';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ZoneBadge, type ZoneKey } from '@/components/shared/zone-badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type {
  AustralianStateCode,
  DirectoryFiltersState,
} from '../types/directory';

import { StateBadgeFilter } from './state-badge-filter';

// Exclude 'anywhere' — it's not a filter-relevant zone
const FILTERABLE_ZONES: ZoneKey[] = ZONE_TYPES.filter(
  (z) => z !== 'anywhere',
) as ZoneKey[];

interface DirectoryFiltersProps {
  filters: DirectoryFiltersState;
  totalCount?: number;
  onSearchChange: (search: string) => void;
  onToggleState: (state: AustralianStateCode) => void;
  onToggleZone: (zone: ZoneKey) => void;
  onResetFilters: () => void;
}

const DEBOUNCE_MS = 300;

export function DirectoryFilters({
  filters,
  totalCount,
  onSearchChange,
  onToggleState,
  onToggleZone,
  onResetFilters,
}: DirectoryFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Sync local search when filters reset externally (e.g. Reset button)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Debounce search → URL params
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onSearchChange(localSearch);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onSearchChange]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.states.length > 0 ||
    filters.zones.length > 0 ||
    filters.favorites;

  return (
    <div className="flex flex-col gap-3">
      {/* Search + count row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search postcodes or suburbs..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        {totalCount !== undefined && (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground tabular-nums">
            {totalCount.toLocaleString()}
          </span>
        )}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* State badges row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {AUSTRALIAN_STATES.map((state) => (
          <StateBadgeFilter
            key={state}
            state={state as AustralianStateCode}
            isActive={
              filters.states.length === 0 ||
              filters.states.includes(state as AustralianStateCode)
            }
            onToggle={onToggleState}
          />
        ))}
      </div>

      {/* Zone badges row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERABLE_ZONES.map((zone) => (
          <button
            key={zone}
            type="button"
            onClick={() => onToggleZone(zone)}
            className={cn(
              'transition-opacity cursor-pointer',
              filters.zones.length === 0 || filters.zones.includes(zone)
                ? 'opacity-100'
                : 'opacity-35',
            )}
          >
            <ZoneBadge zone={zone} size="sm" />
          </button>
        ))}
      </div>
    </div>
  );
}
