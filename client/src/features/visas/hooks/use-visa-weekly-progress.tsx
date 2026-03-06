/**
 * Visa Weekly Progress Hook (UI wrapper)
 *
 * Combines useVisaContext with the React Query hook
 * to provide weekly progress for the current visa.
 *
 * This is a UI hook that uses the current visa from context.
 * For direct API access, use useVisaWeeklyProgress from api/use-visas.ts
 */

import { useVisaWeeklyProgress as useVisaWeeklyProgressQuery } from '../api/use-visas';
import type { WeeklyProgress } from '@get-granted/shared';

import { useVisaContext } from './use-visa-context';

export function useVisaWeeklyProgress() {
  const { currentVisa } = useVisaContext();

  const {
    data: weeklyProgress,
    isLoading,
    error,
    refetch,
  } = useVisaWeeklyProgressQuery(currentVisa?.id ?? '');

  return {
    weeklyProgress: (weeklyProgress ?? []) as WeeklyProgress[],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
