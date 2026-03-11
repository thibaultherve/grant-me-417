import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { VisaType } from '@get-granted/shared';
import type { VisaTypeWithAvailability } from '../hooks/use-available-visas';
import { getVisaOrdinal } from '../utils/visa-helpers';

interface VisaNumberSelectorProps {
  value: VisaType | null;
  onChange: (type: VisaType) => void;
  allVisaTypes: VisaTypeWithAvailability[];
}

const VISA_COLORS: Record<VisaType, { color: string; selectedBg: string }> = {
  first_whv: { color: '#10b981', selectedBg: '#f0fdf4' },
  second_whv: { color: '#3b82f6', selectedBg: '#eff6ff' },
  third_whv: { color: '#f59e0b', selectedBg: '#fffbeb' },
};

export function VisaNumberSelector({ value, onChange, allVisaTypes }: VisaNumberSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <span
        className="font-medium"
        style={{ fontSize: 12, color: '#6c727e' }}
      >
        Which visa are you adding?
      </span>

      {/* Options */}
      <TooltipProvider>
        <div
          role="radiogroup"
          aria-label="Visa number"
          className="flex gap-2"
        >
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
                  backgroundColor: isSelected ? selectedBg : '#f8f8f8',
                  border: isSelected
                    ? `2px solid ${color}`
                    : '1px solid #d1d4db',
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
                    color: isSelected ? color : '#6c727e',
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
