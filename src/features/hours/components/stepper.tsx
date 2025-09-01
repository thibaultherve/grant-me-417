import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  currentStep: 1 | 2
  className?: string
}

export function Stepper({ currentStep, className }: StepperProps) {
  const steps = [
    { number: 1, title: 'Select Employer', description: 'Choose the employer for your work hours' },
    { number: 2, title: 'Add Hours', description: 'Enter your daily or weekly work hours' }
  ]

  return (
    <div className={cn('mb-3', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center text-center flex-1">
              {/* Step Circle */}
              <div className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full border transition-colors',
                currentStep > step.number
                  ? 'bg-primary border-primary text-primary-foreground'
                  : currentStep === step.number
                  ? 'border-primary text-primary bg-background'
                  : 'border-muted-foreground/30 text-muted-foreground bg-background'
              )}>
                {currentStep > step.number ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-medium">{step.number}</span>
                )}
              </div>
              
              {/* Step Content */}
              <div className="mt-1 flex-1">
                <h3 className={cn(
                  'text-xs font-medium',
                  currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.title}
                </h3>
                <p className={cn(
                  'text-xs mt-0.5 hidden sm:block',
                  currentStep >= step.number ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )}>
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-2 transition-colors',
                currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/30'
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}