import { useMemo } from 'react';

import type { VisaType } from '../types';

import { useVisaContext } from './use-visa-context';

const ALL_VISA_TYPES: VisaType[] = ['first_whv', 'second_whv', 'third_whv'];

export function useAvailableVisas() {
  const { visas, isLoading, error } = useVisaContext();

  const availableVisaTypes = useMemo(() => {
    if (isLoading) return [];

    const existingVisaTypes = visas.map((visa) => visa.visa_type);

    return ALL_VISA_TYPES.filter((type) => !existingVisaTypes.includes(type));
  }, [visas, isLoading]);

  return {
    availableVisaTypes,
    loading: isLoading,
    error,
    hasAvailableVisas: availableVisaTypes.length > 0,
  };
}
