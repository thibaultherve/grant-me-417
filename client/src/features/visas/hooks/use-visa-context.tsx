/**
 * VisaContext v2 - Version simplifiée avec React Query
 *
 * Ce context ne gère que:
 * - Le visa actuellement sélectionné
 * - La persistance localStorage
 *
 * Les données sont gérées par React Query (useVisas hook)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import { useVisas } from '../api/use-visas';
import type { Visa } from '@regranted/shared';

interface VisaContextValue {
  currentVisa: Visa | null;
  setCurrentVisa: (visa: Visa | null) => void;
  // Les données viennent de React Query maintenant
  visas: Visa[];
  isLoading: boolean;
  error: Error | null;
}

const VisaContext = createContext<VisaContextValue | undefined>(undefined);

export function VisaProvider({ children }: { children: ReactNode }) {
  const [currentVisa, setCurrentVisaState] = useState<Visa | null>(null);

  // React Query pour les données
  const { data: visas = [], isLoading, error } = useVisas();

  // Restaurer le visa sélectionné depuis localStorage
  useEffect(() => {
    if (!isLoading && visas.length > 0) {
      const savedVisaId = localStorage.getItem('currentVisaId');
      if (savedVisaId) {
        const savedVisa = visas.find((v) => v.id === savedVisaId);
        setCurrentVisaState(savedVisa || visas[0]);
      } else {
        setCurrentVisaState(visas[0]);
      }
    } else if (!isLoading && visas.length === 0) {
      setCurrentVisaState(null);
    }
  }, [visas, isLoading]);

  // Sauvegarder en localStorage
  const setCurrentVisa = (visa: Visa | null) => {
    setCurrentVisaState(visa);
    if (visa) {
      localStorage.setItem('currentVisaId', visa.id);
    } else {
      localStorage.removeItem('currentVisaId');
    }
  };

  return (
    <VisaContext.Provider
      value={{
        currentVisa,
        setCurrentVisa,
        visas,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </VisaContext.Provider>
  );
}

export function useVisaContext() {
  const context = useContext(VisaContext);
  if (context === undefined) {
    throw new Error('useVisaContext must be used within a VisaProvider');
  }
  return context;
}
