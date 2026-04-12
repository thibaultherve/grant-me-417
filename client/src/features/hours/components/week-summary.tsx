import { cn } from '@/lib/utils';

interface WeekSummaryProps {
  weekTotal: number;
  employerCount: number;
  className?: string;
}

export function WeekSummary({
  weekTotal,
  employerCount,
  className,
}: WeekSummaryProps) {
  return (
    <div
      className={cn('flex items-center justify-between px-1 py-2', className)}
    >
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground">Week total:</span>
        <span
          className={cn(
            'text-[13px] font-bold',
            weekTotal > 0 ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {weekTotal}h
        </span>
      </div>
      <span className="text-xs text-muted-foreground">
        {employerCount} employer{employerCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
