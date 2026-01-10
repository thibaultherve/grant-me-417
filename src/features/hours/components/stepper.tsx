import { cn } from '@/lib/utils';

interface StepperProps {
  currentStep: 1 | 2;
  className?: string;
}

export function Stepper({ currentStep, className }: StepperProps) {
  const steps = [
    { number: 1, label: 'Employer' },
    { number: 2, label: 'Hours' },
  ];

  return (
    <div className={cn('mb-4', className)}>
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center gap-2">
            {/* Dot */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  currentStep >= step.number
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30',
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  currentStep >= step.number
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-px transition-colors -mb-4',
                  currentStep > step.number
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
