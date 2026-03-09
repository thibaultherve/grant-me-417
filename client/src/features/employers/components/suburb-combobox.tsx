import { Search, X, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { PostcodeBadgeData, SuburbWithPostcode } from '@get-granted/shared';

import { useSearchSuburbs, useGetSuburb } from '../api/use-suburbs';
import { ZoneBadge, type ZoneKey } from './zone-badge';

// Zone flag → ZoneKey mapping (only 5 zones shown in results — no "anywhere")
const ZONE_FLAGS: { flag: keyof PostcodeBadgeData; zone: ZoneKey }[] = [
  { flag: 'isNorthernAustralia', zone: 'northern' },
  { flag: 'isRemoteVeryRemote', zone: 'remote' },
  { flag: 'isRegionalAustralia', zone: 'regional' },
  { flag: 'isBushfireDeclared', zone: 'bushfire' },
  { flag: 'isNaturalDisasterDeclared', zone: 'weather' },
];

// Static class strings required for Tailwind v4 detection at build time
const STATE_CONFIG: Record<string, { bg: string; fg: string }> = {
  ACT: { bg: 'bg-state-act', fg: 'text-white' },
  NSW: { bg: 'bg-state-nsw', fg: 'text-state-nsw-fg' },
  NT: { bg: 'bg-state-nt', fg: 'text-white' },
  QLD: { bg: 'bg-state-qld', fg: 'text-white' },
  SA: { bg: 'bg-state-sa', fg: 'text-white' },
  TAS: { bg: 'bg-state-tas', fg: 'text-white' },
  VIC: { bg: 'bg-state-vic', fg: 'text-white' },
  WA: { bg: 'bg-state-wa', fg: 'text-state-wa-fg' },
};

function StateBadge({ state }: { state: string }) {
  const config = STATE_CONFIG[state] ?? { bg: 'bg-muted', fg: 'text-muted-foreground' };
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0',
        config.bg,
        config.fg,
      )}
    >
      {state}
    </span>
  );
}

function PostcodeBadge({ postcode }: { postcode: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-border text-[10px] font-medium text-muted-foreground shrink-0">
      {postcode}
    </span>
  );
}

interface SuburbComboboxProps {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  disabled?: boolean;
}

export function SuburbCombobox({
  value,
  onValueChange,
  disabled,
}: SuburbComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [forceClear, setForceClear] = useState(false);

  const { data: selectedSuburb } = useGetSuburb(value);
  const { data: suburbs = [], isLoading } = useSearchSuburbs(debouncedQuery);

  // Debounce search query (200ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue), 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Click outside → close dropdown
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const hasValue = value !== undefined && selectedSuburb !== undefined && !forceClear;

  const selectedActiveZones: ZoneKey[] = selectedSuburb?.postcodeData
    ? ZONE_FLAGS.filter((z) => selectedSuburb.postcodeData![z.flag]).map((z) => z.zone)
    : [];

  const handleFocus = () => {
    setOpen(true);
    setActiveIndex(-1);
    // Restore last search query — do not overwrite with suburb name
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setActiveIndex(-1);
    if (!open) setOpen(true);
    // Clear selection when user starts typing
    if (value !== undefined) onValueChange(undefined);
  };

  const handleSelect = (suburb: SuburbWithPostcode) => {
    setForceClear(false);
    onValueChange(suburb.id);
    // Keep inputValue as-is so re-opening restores the last search
    setActiveIndex(-1);
    setOpen(false);
  };

  // Filled state: clears the selected suburb entirely
  const handleClear = () => {
    setForceClear(true); // immediate UI transition, no wait for parent re-render
    onValueChange(undefined);
    setInputValue('');
    setDebouncedQuery('');
    setActiveIndex(-1);
    setOpen(false);
  };

  // Search state: clears typed text + selected suburb if any, keeps dropdown open
  const handleClearInput = () => {
    if (value !== undefined) {
      setForceClear(true);
      onValueChange(undefined);
    }
    setInputValue('');
    setDebouncedQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suburbs.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = Math.min(i + 1, suburbs.length - 1);
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = Math.max(i - 1, 0);
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suburbs.length) {
        handleSelect(suburbs[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const scrollActiveIntoView = (index: number) => {
    if (!listRef.current) return;
    const item = listRef.current.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  };

  const showDropdown = open && (isLoading || debouncedQuery.length > 0);

  return (
    <div ref={containerRef} className="relative">
      {/* Filled state — suburb selected, dropdown closed */}
      {hasValue && !open ? (
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-lg border border-input bg-background cursor-pointer transition-colors',
            disabled && 'opacity-50 pointer-events-none',
          )}
          onClick={handleFocus}
        >
          <span className="flex-1 text-[13px] font-medium text-foreground truncate">
            {selectedSuburb.suburbName}
          </span>
          <StateBadge state={selectedSuburb.stateCode} />
          <PostcodeBadge postcode={selectedSuburb.postcode} />
          {selectedActiveZones.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {selectedActiveZones.map((zone) => (
                <ZoneBadge key={zone} zone={zone} size="sm" />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Search input — default or open state */
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-background cursor-text transition-colors',
            open ? 'border-ring ring-1 ring-ring/20' : 'border-input',
            disabled && 'opacity-50 pointer-events-none',
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />

          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search suburb or postcode..."
            disabled={disabled}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground min-w-0"
          />

          {isLoading && (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
          )}

          {inputValue.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearInput();
              }}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Helper text — shown when closed and no suburb selected */}
      {!open && !hasValue && (
        <p className="text-xs text-muted-foreground mt-1.5">
          Enter your work location to determine the eligibility
        </p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-md overflow-hidden">
          {/* Results count header */}
          {!isLoading && suburbs.length > 0 && (
            <div className="px-3 py-2 bg-muted">
              <span className="text-[11px] text-muted-foreground">
                {suburbs.length} result{suburbs.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && debouncedQuery.length > 0 && suburbs.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No suburbs found.
            </div>
          )}

          {/* Result rows */}
          {!isLoading && suburbs.length > 0 && (
            <div ref={listRef} className="max-h-64 overflow-y-auto">
              {suburbs.map((suburb, index) => {
                const activeZones: ZoneKey[] = suburb.postcodeData
                  ? ZONE_FLAGS.filter((z) => suburb.postcodeData![z.flag]).map((z) => z.zone)
                  : [];

                return (
                  <button
                    key={suburb.id}
                    type="button"
                    onClick={() => handleSelect(suburb)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors',
                      activeIndex === index ? 'bg-accent' : 'hover:bg-accent',
                    )}
                  >
                    <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
                      {suburb.suburbName}
                    </span>
                    <StateBadge state={suburb.stateCode} />
                    <PostcodeBadge postcode={suburb.postcode} />
                    {activeZones.length > 0 && (
                      <div className="flex items-center gap-1 shrink-0">
                        {activeZones.map((zone) => (
                          <ZoneBadge key={zone} zone={zone} size="sm" />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
