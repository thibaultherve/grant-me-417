import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVisaContext } from '../hooks/use-visa-context';
import type { VisaType } from '../types';

const visaTypeLabels: Record<VisaType, string> = {
  first_whv: '1st WHV',
  second_whv: '2nd WHV', 
  third_whv: '3rd WHV'
};

export function VisaSelector() {
  const { visas, currentVisa, setCurrentVisa, isLoading: loading } = useVisaContext();

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

  if (visas.length === 1) {
    return (
      <Button variant="outline" disabled className="w-[180px] justify-between">
        {visaTypeLabels[visas[0].visa_type]}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[180px] justify-between"
        >
          {currentVisa ? visaTypeLabels[currentVisa.visa_type] : 'Select visa...'}
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
            {visaTypeLabels[visa.visa_type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}