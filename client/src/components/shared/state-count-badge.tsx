import { STATE_CONFIG } from '@/components/shared/postcode-link-badge';
import { cn } from '@/lib/utils';

interface StateCountBadgeProps {
  stateCode: string;
  count: number;
  className?: string;
}

export function StateCountBadge({
  stateCode,
  count,
  className,
}: StateCountBadgeProps) {
  const config = STATE_CONFIG[stateCode] ?? {
    bg: 'bg-muted',
    fg: 'text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1 py-0.5 text-[10px] font-semibold leading-none',
        config.bg,
        config.fg,
        className,
      )}
    >
      {stateCode}
      <span className="ml-0.5 opacity-80">{count}</span>
    </span>
  );
}
