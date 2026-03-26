import { cn } from '@/lib/utils';

import { formatDayHours } from '../../utils/weekly-helpers';

interface HoursCellProps {
  hours: number | undefined;
  /** Whether this day is outside the current month */
  isOutOfMonth?: boolean;
  className?: string;
}

export function HoursCell({ hours, isOutOfMonth, className }: HoursCellProps) {
  const display = formatDayHours(hours);
  const isEmpty = display === '–';

  return (
    <span
      className={cn(
        'tabular-nums text-center text-[13px]',
        isEmpty ? 'font-normal text-muted-foreground' : 'font-medium text-foreground',
        isOutOfMonth && 'opacity-40',
        className,
      )}
    >
      {display}
    </span>
  );
}
