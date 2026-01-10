import { useMemo } from 'react';

import type { VisaType } from '../types';

import { useVisaContext } from './use-visa-context';

interface AvailableVisa {
  type: VisaType;
  title: string;
  description: string;
  requiredDays: number;
  duration: string;
  icon: string;
  variant: 'default' | 'secondary' | 'outline';
}

const allVisaOptions: AvailableVisa[] = [
  {
    type: 'first_whv',
    title: 'First WHV (417)',
    description: 'Your initial Working Holiday Visa',
    requiredDays: 0,
    duration: '12 months',
    icon: 'Plane',
    variant: 'default',
  },
  {
    type: 'second_whv',
    title: 'Second WHV (417)',
    description: 'Requires 88 days of specified work during 1st WHV',
    requiredDays: 88,
    duration: '12 months',
    icon: 'Clock',
    variant: 'secondary',
  },
  {
    type: 'third_whv',
    title: 'Third WHV (417)',
    description: 'Requires 179 days of specified work during 2nd WHV',
    requiredDays: 179,
    duration: '12 months',
    icon: 'CheckCircle',
    variant: 'outline',
  },
];

export function useAvailableVisas() {
  const { visas, isLoading, error } = useVisaContext();

  const availableVisas = useMemo(() => {
    if (isLoading) return [];

    // Get visa types that the user already has
    const existingVisaTypes = visas.map((visa) => visa.visa_type);

    // Filter out visas that the user already possesses
    return allVisaOptions.filter(
      (visaOption) => !existingVisaTypes.includes(visaOption.type),
    );
  }, [visas, isLoading]);

  return {
    availableVisas,
    loading: isLoading,
    error,
    hasAvailableVisas: availableVisas.length > 0,
  };
}
