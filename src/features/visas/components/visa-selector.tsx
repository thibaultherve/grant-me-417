import { Check, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { VISA_LABELS } from '../constants';
import { useVisaContext } from '../hooks/use-visa-context';

export function VisaSelector() {
  const {
    visas,
    currentVisa,
    setCurrentVisa,
    isLoading: loading,
  } = useVisaContext();

  if (loading) {
    return (
      <Button variant="outline" disabled className="w-[180px] justify-between">
        Loading visas...
      </Button>
    );
  }

  if (visas.length === 0) {
    return (
      <Button variant="outline" disabled className="w-[180px] justify-between">
        No visas available
      </Button>
    );
  }

  // Always show dropdown, even with single visa (allows viewing/modifying visa)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          {currentVisa
            ? VISA_LABELS[currentVisa.visa_type]
            : 'Select visa...'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        {visas.map((visa) => (
          <DropdownMenuItem
            key={visa.id}
            onClick={() => setCurrentVisa(visa)}
            className="cursor-pointer"
          >
            <Check
              className={`mr-2 h-4 w-4 ${
                currentVisa?.id === visa.id ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {VISA_LABELS[visa.visa_type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
