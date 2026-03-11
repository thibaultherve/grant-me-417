interface VisaProgressBarProps {
  percent: number; // 0-100
  variant:
    | 'timeline-active'
    | 'timeline-expired'
    | 'progress-active'
    | 'progress-complete'
    | 'progress-expired';
  className?: string;
}

const variantFillClass: Record<VisaProgressBarProps['variant'], string> = {
  'timeline-active': 'bg-primary',
  'timeline-expired': 'bg-destructive',
  'progress-active': 'bg-primary',
  'progress-complete': 'bg-success',
  'progress-expired': 'bg-muted-foreground',
};

export function VisaProgressBar({ percent, variant, className = '' }: VisaProgressBarProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  return (
    <div className={`bg-secondary rounded-full overflow-hidden shrink-0 ${className}`} style={{ height: 6 }}>
      <div
        className={`h-full rounded-full ${variantFillClass[variant]}`}
        style={{ width: `${clampedPercent}%` }}
      />
    </div>
  );
}
