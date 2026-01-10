/**
 * Add Hours Form Component
 *
 * A two-step form for adding work hours:
 * 1. Select an employer
 * 2. Enter hours for the week using the unified WeekHoursForm
 *
 * @example
 * ```tsx
 * <AddHoursForm
 *   onSuccess={() => console.log('Hours added')}
 *   onCancel={() => console.log('Cancelled')}
 * />
 * ```
 */

import { Building2, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useEmployers } from '@/features/employers/api/use-employers';
import type { Employer } from '@/features/employers/types';
import { cn } from '@/lib/utils';

import { EmployerSelector } from '../inputs/employer-selector';
import { Stepper } from '../ui/stepper';
import { WeekHoursForm } from './week-hours-form';

interface AddHoursFormProps {
  /** Callback when hours are successfully saved */
  onSuccess?: () => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/** Industry type labels for display */
const industryLabels: Record<string, string> = {
  plant_and_animal_cultivation: 'Plant & Animal Cultivation',
  fishing_and_pearling: 'Fishing & Pearling',
  tree_farming_and_felling: 'Tree Farming & Felling',
  mining: 'Mining',
  construction: 'Construction',
  hospitality_and_tourism: 'Hospitality & Tourism',
  bushfire_recovery_work: 'Bushfire Recovery',
  critical_covid19_work: 'Critical COVID-19 Work',
  other: 'Other',
};

export function AddHoursForm({
  onSuccess,
  onCancel,
  className,
}: AddHoursFormProps) {
  // State management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
    null,
  );

  // Hooks
  const { data: employers = [], isLoading: employersLoading } = useEmployers();

  // Handlers
  const handleEmployerSelect = (employer: Employer) => {
    setSelectedEmployer(employer);
  };

  const handleContinueToAddHours = () => {
    setCurrentStep(2);
  };

  const handleBackToEmployerSelection = () => {
    setCurrentStep(1);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Stepper currentStep={currentStep} />

      {/* Step 1: Employer Selection */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <EmployerSelector
            employers={employers}
            selectedEmployer={selectedEmployer}
            onSelectEmployer={handleEmployerSelect}
            onContinue={handleContinueToAddHours}
            loading={employersLoading}
          />

          {/* Action Buttons */}
          <div className="flex justify-between pt-2 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Hours Entry */}
      {currentStep === 2 && selectedEmployer && (
        <div className="space-y-4">
          {/* Selected Employer - Simple text with Change link */}
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{selectedEmployer.name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {industryLabels[selectedEmployer.industry] ||
                  selectedEmployer.industry}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToEmployerSelection}
              className="h-8 text-xs"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Change
            </Button>
          </div>

          {/* Unified Week Hours Form */}
          <WeekHoursForm
            employerId={selectedEmployer.id}
            employerName={selectedEmployer.name}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </div>
      )}
    </div>
  );
}
