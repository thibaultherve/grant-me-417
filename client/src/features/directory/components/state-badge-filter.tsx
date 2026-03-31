import { STATE_CONFIG } from '@/components/shared/postcode-link-badge';
import { cn } from '@/lib/utils';

import type { AustralianStateCode } from '../types/directory';

interface StateBadgeFilterProps {
  state: AustralianStateCode;
  isActive: boolean;
  onToggle: (state: AustralianStateCode) => void;
}

export function StateBadgeFilter({
  state,
  isActive,
  onToggle,
}: StateBadgeFilterProps) {
  const config = STATE_CONFIG[state] ?? {
    bg: 'bg-muted',
    fg: 'text-muted-foreground',
  };

  return (
    <button
      type="button"
      onClick={() => onToggle(state)}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-bold transition-opacity cursor-pointer',
        config.bg,
        config.fg,
        isActive ? 'opacity-100' : 'opacity-35',
      )}
    >
      {state}
    </button>
  );
}
