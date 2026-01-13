import { Check, ChevronsUpDown, MapPin, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { useSearchSuburbs, useGetSuburb } from '../api/use-suburbs';
import type { SuburbWithPostcode } from '../types/suburb';

import { PostcodeBadges } from './postcode-badges';

interface SuburbComboboxProps {
  value: number | undefined;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const formatSuburbDisplay = (suburb: SuburbWithPostcode): string => {
  return `${suburb.suburb_name}, ${suburb.postcode} ${suburb.state_code}`;
};

export function SuburbCombobox({
  value,
  onValueChange,
  disabled,
}: SuburbComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suburbs = [], isLoading } = useSearchSuburbs(debouncedQuery);
  const { data: selectedSuburb } = useGetSuburb(value);

  const handleSelect = (suburb: SuburbWithPostcode) => {
    onValueChange(suburb.id);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 text-base"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedSuburb ? (
              <>
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {formatSuburbDisplay(selectedSuburb)}
                </span>
                {selectedSuburb.postcodeData && (
                  <PostcodeBadges
                    postcode={selectedSuburb.postcodeData}
                    size="sm"
                    className="shrink-0"
                  />
                )}
              </>
            ) : (
              <span className="text-muted-foreground">
                Search by postcode or suburb name...
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by postcode or suburb name..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12 text-base"
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && debouncedQuery.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type to search suburbs...
              </div>
            )}
            {!isLoading &&
              debouncedQuery.length > 0 &&
              suburbs.length === 0 && (
                <CommandEmpty>No suburbs found.</CommandEmpty>
              )}
            {!isLoading && suburbs.length > 0 && (
              <CommandGroup>
                {suburbs.map((suburb) => (
                  <CommandItem
                    key={suburb.id}
                    value={suburb.id.toString()}
                    onSelect={() => handleSelect(suburb)}
                    className="flex items-center justify-between py-3 cursor-pointer"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0',
                          value === suburb.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">
                        {formatSuburbDisplay(suburb)}
                      </span>
                    </span>
                    {suburb.postcodeData && (
                      <PostcodeBadges
                        postcode={suburb.postcodeData}
                        size="sm"
                        className="ml-2 shrink-0"
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
