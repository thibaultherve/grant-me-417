import { Check, ChevronsUpDown } from 'lucide-react';
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

import { useSearchPostcodes, useGetPostcode } from '../api/use-postcodes';

import { PostcodeBadges } from './postcode-badges';

interface PostcodeComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function PostcodeCombobox({
  value,
  onValueChange,
  disabled,
}: PostcodeComboboxProps) {
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

  const { data: postcodes = [], isLoading } =
    useSearchPostcodes(debouncedQuery);
  const { data: selectedPostcode } = useGetPostcode(value);

  const handleSelect = (selectedPostcode: string) => {
    onValueChange(selectedPostcode === value ? '' : selectedPostcode);
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
          <div className="flex items-center gap-2 flex-1">
            <span>{value || 'Search postcode...'}</span>
            {value && selectedPostcode && (
              <PostcodeBadges postcode={selectedPostcode} />
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type postcode..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12 text-base"
          />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}
            {!isLoading && debouncedQuery.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Start typing to search postcodes
              </div>
            )}
            {!isLoading &&
              debouncedQuery.length > 0 &&
              postcodes.length === 0 && (
                <CommandEmpty>No postcode found.</CommandEmpty>
              )}
            {!isLoading && postcodes.length > 0 && (
              <CommandGroup>
                {postcodes.map((postcode) => (
                  <CommandItem
                    key={postcode.postcode}
                    value={postcode.postcode}
                    onSelect={() => handleSelect(postcode.postcode)}
                    className="flex items-center gap-2 py-3 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === postcode.postcode
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <span className="font-mono">{postcode.postcode}</span>
                    <PostcodeBadges postcode={postcode} className="ml-auto" />
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
