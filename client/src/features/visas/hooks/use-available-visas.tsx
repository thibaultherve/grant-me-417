import { useMemo } from 'react';

import type { VisaType } from '@regranted/shared';

import { useVisaContext } from './use-visa-context';

const ALL_VISA_TYPES: VisaType[] = ['first_whv', 'second_whv', 'third_whv'];

export interface VisaTypeWithAvailability {
  type: VisaType;
  isAvailable: boolean;
}

export function useAvailableVisas() {
  const { visas, isLoading, error } = useVisaContext();

  const allVisaTypes = useMemo((): VisaTypeWithAvailability[] => {
    if (isLoading) return ALL_VISA_TYPES.map((type) => ({ type, isAvailable: false }));

    const existingVisaTypes = visas.map((visa) => visa.visaType);

    return ALL_VISA_TYPES.map((type) => ({
      type,
      isAvailable: !existingVisaTypes.includes(type),
    }));
  }, [visas, isLoading]);

  const availableVisaTypes = useMemo(
    () => allVisaTypes.filter((v) => v.isAvailable).map((v) => v.type),
    [allVisaTypes],
  );

  return {
    allVisaTypes,
    availableVisaTypes,
    loading: isLoading,
    error,
    hasAvailableVisas: availableVisaTypes.length > 0,
  };
}
