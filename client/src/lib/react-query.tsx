import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query configuration
 *
 * Default options suivent les recommandations bulletproof-react:
 * - Server cache state séparé du UI state
 * - Cache intelligent avec refetch automatique
 * - Error handling centralisé
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/important-defaults
 */

const queryConfig = {
  queries: {
    // Cache validity - données considérées fraîches pendant 5 min
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Cache duration - garde les données en cache 10 min après le dernier usage
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)

    // Refetch automatiquement quand l'utilisateur revient sur l'onglet
    refetchOnWindowFocus: true,

    // Refetch après reconnexion réseau
    refetchOnReconnect: true,

    // Refetch au mount si les données sont stale (comportement par défaut de React Query)
    // Important pour que les données invalidées soient rechargées lors de la navigation
    refetchOnMount: true,

    // Retry une fois en cas d'erreur
    retry: 1,

    // Durée avant retry (exponentielle)
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Pas de retry automatique pour les mutations (POST, PUT, DELETE)
    retry: 0,
  },
};

/**
 * Instance globale du QueryClient
 * À utiliser dans QueryClientProvider
 */
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Query keys factory pattern
 * Centralise toutes les clés de queries pour éviter les typos
 *
 * @example
 * ```ts
 * useQuery({
 *   queryKey: queryKeys.employers.all,
 *   queryFn: getEmployers
 * })
 * ```
 */
export const queryKeys = {
  employers: {
    all: ['employers'] as const,
    detail: (id: string) => ['employers', id] as const,
  },
  hours: {
    all: ['hours'] as const,
    list: (filters: Record<string, unknown>) =>
      ['hours', 'list', filters] as const,
    detail: (id: string) => ['hours', id] as const,
    byEmployer: (employerId: string) =>
      ['hours', 'employer', employerId] as const,
    month: (year: number, month: number) =>
      ['hours', 'month', year, month] as const,
  },
  visas: {
    all: ['visas'] as const,
    detail: (id: string) => ['visas', id] as const,
    byType: (type: string) => ['visas', 'type', type] as const,
    weeklyProgress: (visaId: string) =>
      ['visas', visaId, 'weekly-progress'] as const,
    overview: (visaId: string) => ['visas', visaId, 'overview'] as const,
  },
} as const;
