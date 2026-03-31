import { cn } from '@/lib/utils';

import type { VisaTypeFilter } from '../types/directory';

interface VisaTypeTabsProps {
  value: VisaTypeFilter;
  onChange: (value: VisaTypeFilter) => void;
  className?: string;
}

const TABS: { value: VisaTypeFilter; label: string }[] = [
  { value: '417', label: 'WHV 417' },
  { value: '462', label: 'WHV 462' },
];

export function VisaTypeTabs({
  value,
  onChange,
  className,
}: VisaTypeTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-muted p-0.5 gap-0.5',
        className,
      )}
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
            value === tab.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
