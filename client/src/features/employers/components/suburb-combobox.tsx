import type { SuburbWithPostcode } from '@regranted/shared';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import { PostcodeLinkBadge } from '@/components/shared/postcode-link-badge';
import {
  ZONE_FLAGS,
  ZoneBadge,
  type ZoneKey,
} from '@/components/shared/zone-badge';
import { useClickOutside } from '@/hooks/use-click-outside';
import { cn } from '@/lib/utils';

import { useGetSuburb, useSearchSuburbs } from '../api/use-suburbs';

interface SuburbComboboxProps {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  disabled?: boolean;
}

type ComboboxState = {
  open: boolean;
  inputValue: string;
  debouncedQuery: string;
  activeIndex: number;
  forceClear: boolean;
};

type ComboboxAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_INPUT'; value: string }
  | { type: 'SET_DEBOUNCED'; value: string }
  | { type: 'SET_ACTIVE_INDEX'; index: number }
  | { type: 'SELECT' }
  | { type: 'CLEAR'; keepFocus?: boolean }
  | { type: 'RESET' };

function comboboxReducer(
  state: ComboboxState,
  action: ComboboxAction,
): ComboboxState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, open: true, activeIndex: -1 };
    case 'CLOSE':
      return { ...state, open: false, activeIndex: -1 };
    case 'SET_INPUT':
      return {
        ...state,
        inputValue: action.value,
        activeIndex: -1,
        open: true,
      };
    case 'SET_DEBOUNCED':
      return { ...state, debouncedQuery: action.value };
    case 'SET_ACTIVE_INDEX':
      return { ...state, activeIndex: action.index };
    case 'SELECT':
      return { ...state, forceClear: false, activeIndex: -1, open: false };
    case 'CLEAR':
      return {
        ...state,
        forceClear: true,
        inputValue: '',
        debouncedQuery: '',
        activeIndex: -1,
        open: action.keepFocus ? state.open : false,
      };
    case 'RESET':
      return {
        open: false,
        inputValue: '',
        debouncedQuery: '',
        activeIndex: -1,
        forceClear: false,
      };
    default:
      return state;
  }
}

const INITIAL_STATE: ComboboxState = {
  open: false,
  inputValue: '',
  debouncedQuery: '',
  activeIndex: -1,
  forceClear: false,
};

export function SuburbCombobox({
  value,
  onValueChange,
  disabled,
}: SuburbComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(comboboxReducer, INITIAL_STATE);

  const { data: selectedSuburb } = useGetSuburb(value);
  const { data: suburbs = [], isLoading } = useSearchSuburbs(
    state.debouncedQuery,
  );

  // Debounce search query (200ms)
  useEffect(() => {
    const timer = setTimeout(
      () => dispatch({ type: 'SET_DEBOUNCED', value: state.inputValue }),
      200,
    );
    return () => clearTimeout(timer);
  }, [state.inputValue]);

  // Click outside → close dropdown
  const handleClose = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  useClickOutside(containerRef, handleClose);

  const hasValue =
    value !== undefined && selectedSuburb !== undefined && !state.forceClear;

  const selectedActiveZones: ZoneKey[] = selectedSuburb?.postcodeData
    ? ZONE_FLAGS.filter((z) => selectedSuburb.postcodeData![z.flag]).map(
        (z) => z.zone,
      )
    : [];

  const handleFocus = () => {
    dispatch({ type: 'OPEN' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_INPUT', value: e.target.value });
    // Clear selection when user starts typing
    if (value !== undefined) onValueChange(undefined);
  };

  const handleSelect = (suburb: SuburbWithPostcode) => {
    dispatch({ type: 'SELECT' });
    onValueChange(suburb.id);
  };

  const handleClear = (keepFocus?: boolean) => {
    dispatch({ type: 'CLEAR', keepFocus });
    onValueChange(undefined);
    if (keepFocus) inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suburbs.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(state.activeIndex + 1, suburbs.length - 1);
      dispatch({ type: 'SET_ACTIVE_INDEX', index: next });
      scrollActiveIntoView(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(state.activeIndex - 1, 0);
      dispatch({ type: 'SET_ACTIVE_INDEX', index: next });
      scrollActiveIntoView(next);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (state.activeIndex >= 0 && state.activeIndex < suburbs.length) {
        handleSelect(suburbs[state.activeIndex]);
      }
    } else if (e.key === 'Escape') {
      dispatch({ type: 'CLOSE' });
    }
  };

  const scrollActiveIntoView = (index: number) => {
    if (!listRef.current) return;
    const item = listRef.current.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  };

  const showDropdown =
    state.open && (isLoading || state.debouncedQuery.length > 0);

  return (
    <div ref={containerRef} className="relative">
      {/* Filled state — suburb selected, dropdown closed */}
      {hasValue && !state.open ? (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-lg border border-input bg-background cursor-pointer transition-colors',
            disabled && 'opacity-50 pointer-events-none',
          )}
          onClick={handleFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFocus();
            }
          }}
        >
          <span className="flex-1 text-[13px] font-medium text-foreground truncate">
            {selectedSuburb.suburbName}
          </span>
          <PostcodeLinkBadge
            postcode={selectedSuburb.postcode}
            stateCode={selectedSuburb.stateCode}
            size="sm"
          />
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
          role="button"
          tabIndex={0}
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-background cursor-text transition-colors',
            state.open ? 'border-ring ring-1 ring-ring/20' : 'border-input',
            disabled && 'opacity-50 pointer-events-none',
          )}
          onClick={() => inputRef.current?.focus()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />

          <input
            ref={inputRef}
            value={state.inputValue}
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

          {state.inputValue.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear(true);
              }}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Helper text — shown when closed and no suburb selected */}
      {!state.open && !hasValue && (
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
          {!isLoading &&
            state.debouncedQuery.length > 0 &&
            suburbs.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No suburbs found.
              </div>
            )}

          {/* Result rows */}
          {!isLoading && suburbs.length > 0 && (
            <div ref={listRef} className="max-h-64 overflow-y-auto">
              {suburbs.map((suburb, index) => {
                const activeZones: ZoneKey[] = suburb.postcodeData
                  ? ZONE_FLAGS.filter((z) => suburb.postcodeData![z.flag]).map(
                      (z) => z.zone,
                    )
                  : [];

                return (
                  <button
                    key={suburb.id}
                    type="button"
                    onClick={() => handleSelect(suburb)}
                    onMouseEnter={() =>
                      dispatch({ type: 'SET_ACTIVE_INDEX', index })
                    }
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors',
                      state.activeIndex === index
                        ? 'bg-accent'
                        : 'hover:bg-accent',
                    )}
                  >
                    <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
                      {suburb.suburbName}
                    </span>
                    <PostcodeLinkBadge
                      postcode={suburb.postcode}
                      stateCode={suburb.stateCode}
                      size="sm"
                      asLink={false}
                    />
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
