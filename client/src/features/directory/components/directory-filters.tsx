import { AUSTRALIAN_STATES, ZONE_TYPES } from '@regranted/shared';
import { Search, Star, X } from 'lucide-react';
import { useRef, useState } from 'react';

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
  favoritesCount?: number;
  onSearchChange: (search: string) => void;
  onToggleState: (state: AustralianStateCode) => void;
  onToggleZone: (zone: ZoneKey) => void;
  onToggleFavorites: () => void;
  onResetFilters: () => void;
}

export function DirectoryFilters({
  filters,
  favoritesCount,
  onSearchChange,
  onToggleState,
  onToggleZone,
  onToggleFavorites,
  onResetFilters,
}: DirectoryFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [lastPropSearch, setLastPropSearch] = useState(filters.search);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Render-phase sync when the URL-driven filter changes externally
  // (e.g. Reset button). React's official pattern for adjusting state on
  // prop change — no useEffect needed.
  if (filters.search !== lastPropSearch) {
    setLastPropSearch(filters.search);
    setLocalSearch(filters.search);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }

  const handleSearchInput = (next: string) => {
    setLocalSearch(next);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(next);
    }, 300);
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.states.length > 0 ||
    filters.zones.length > 0 ||
    filters.favorites;

  return (
    <div className="flex flex-col gap-2">
      {/* Search row */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search postcodes or suburbs..."
          value={localSearch}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="pl-8 h-8 text-[13px]"
        />
      </div>

      {/* Filter row: State container | separator | Zone container | spacer | Favorites | Reset */}
      <div className="flex items-center gap-2">
        {/* State badges container */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5">
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

        {/* Vertical separator */}
        <div className="h-5 w-px bg-border shrink-0" />

        {/* Zone chips container */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5">
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

        {/* Spacer */}
        <div className="grow" />

        {/* Favorites filter button */}
        <button
          type="button"
          onClick={onToggleFavorites}
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 h-8 text-[10px] font-semibold cursor-pointer transition-colors',
            filters.favorites
              ? 'bg-warning-light border-warning text-warning-dark'
              : 'bg-card border-border text-muted-foreground hover:border-warning/50',
          )}
        >
          <Star
            className={cn(
              'w-3 h-3',
              filters.favorites
                ? 'text-warning fill-warning'
                : 'text-muted-foreground',
            )}
          />
          Favorites
          {favoritesCount !== undefined && favoritesCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-warning text-white text-[8px] font-bold">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 h-8 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-2.5 h-2.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
