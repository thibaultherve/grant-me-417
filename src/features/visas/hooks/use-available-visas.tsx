import { useMemo } from 'react';

import { VISA_LABELS } from '../constants';
import type { VisaType } from '../types';

import { useVisaContext } from './use-visa-context';

export function useAvailableVisas() {
  const { visas, isLoading, error } = useVisaContext();

  const availableVisaTypes = useMemo(() => {
    if (isLoading) return [];

    const existingVisaTypes = visas.map((visa) => visa.visa_type);

    return (Object.keys(VISA_LABELS) as VisaType[]).filter(
      (type) => !existingVisaTypes.includes(type),
    );
  }, [visas, isLoading]);

  return {
    availableVisaTypes,
    loading: isLoading,
    error,
    hasAvailableVisas: availableVisaTypes.length > 0,
  };
}
