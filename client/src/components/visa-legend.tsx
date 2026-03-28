import type { VisaType } from '@regranted/shared';
import { cn } from '@/lib/utils';

const LEGEND_ITEMS: { visaType: VisaType; label: string; color: string }[] = [
  { visaType: 'first_whv', label: '1st Visa', color: 'bg-visa-1st-color' },
  { visaType: 'second_whv', label: '2nd Visa', color: 'bg-visa-2nd-color' },
  { visaType: 'third_whv', label: '3rd Visa', color: 'bg-visa-3rd-color' },
];

interface VisaLegendProps {
  visaTypes?: VisaType[];
  className?: string;
}

export function VisaLegend({ visaTypes, className }: VisaLegendProps) {
  const items = visaTypes
    ? LEGEND_ITEMS.filter((item) => visaTypes.includes(item.visaType))
    : LEGEND_ITEMS;

  if (items.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={cn(
              'h-1.25 w-1.25 rounded-full',
              item.color,
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
