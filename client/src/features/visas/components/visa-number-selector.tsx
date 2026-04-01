import type { VisaType } from '@regranted/shared';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getVisaOrdinal } from '@/utils/visa-helpers';

import type { VisaTypeWithAvailability } from '../hooks/use-available-visas';

interface VisaNumberSelectorProps {
  value: VisaType | null;
  onChange: (type: VisaType) => void;
  allVisaTypes: VisaTypeWithAvailability[];
}

const VISA_COLORS: Record<VisaType, { color: string; selectedBg: string }> = {
  first_whv: {
    color: 'var(--visa-1st-color)',
    selectedBg: 'var(--visa-1st-light)',
  },
  second_whv: {
    color: 'var(--visa-2nd-color)',
    selectedBg: 'var(--visa-2nd-light)',
  },
  third_whv: {
    color: 'var(--visa-3rd-color)',
    selectedBg: 'var(--visa-3rd-light)',
  },
};

export function VisaNumberSelector({
  value,
  onChange,
  allVisaTypes,
}: VisaNumberSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <span className="font-medium text-xs text-muted-foreground">
        Which visa are you adding?
      </span>

      {/* Options */}
      <TooltipProvider>
        <div role="radiogroup" aria-label="Visa number" className="flex gap-2">
          {allVisaTypes.map(({ type, isAvailable }) => {
            const isSelected = value === type;
            const { color, selectedBg } = VISA_COLORS[type];
            const ordinal = getVisaOrdinal(type);

            const card = (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={!isAvailable}
                disabled={!isAvailable}
                onClick={() => isAvailable && onChange(type)}
                className="flex-1 flex flex-col items-center gap-1.5 rounded-lg transition-colors"
                style={{
                  padding: '12px 0',
                  backgroundColor: isSelected
                    ? selectedBg
                    : 'var(--background)',
                  border: isSelected
                    ? `2px solid ${color}`
                    : '1px solid var(--border)',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.5,
                  outline: 'none',
                }}
              >
                {/* Badge */}
                <span
                  className="inline-flex items-center justify-center text-white"
                  style={{
                    width: 32,
                    height: 22,
                    borderRadius: 4,
                    backgroundColor: color,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {ordinal}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? color : 'var(--muted-foreground)',
                  }}
                >
                  WHV 417
                </span>
              </button>
            );

            if (!isAvailable) {
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>{card}</TooltipTrigger>
                  <TooltipContent>Already added</TooltipContent>
                </Tooltip>
              );
            }

            return card;
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
