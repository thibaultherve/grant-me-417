import { cn } from '@/lib/utils';

const LEGEND_ITEMS = [
  { label: '1st Visa', color: 'bg-visa-1st-color' },
  { label: '2nd Visa', color: 'bg-visa-2nd-color' },
  { label: '3rd Visa', color: 'bg-visa-3rd-color' },
  { label: 'No visa', color: 'bg-muted', border: true },
] as const;

interface VisaLegendProps {
  className?: string;
}

export function VisaLegend({ className }: VisaLegendProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-[5px]">
          <div
            className={cn(
              'h-[3px] w-[18px] rounded-sm',
              item.color,
              'border' in item && item.border && 'border border-border',
            )}
          />
          <span className="text-[11px] font-medium text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
