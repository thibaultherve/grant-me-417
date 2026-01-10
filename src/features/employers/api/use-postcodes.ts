/**
 * Postcodes React Query Hooks
 *
 * Custom hooks for postcode data fetching with caching
 * Follows bulletproof-react api-layer pattern
 */

import { useQuery } from '@tanstack/react-query';

import { getPostcode, searchPostcodes, validatePostcode } from './postcodes';

/**
 * Hook for searching postcodes with debouncing handled by component
 * Disabled when query is empty
 */
export const useSearchPostcodes = (query: string) => {
  return useQuery({
    queryKey: ['postcodes', 'search', query],
    queryFn: () => searchPostcodes(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for validating a single postcode
 */
export const useValidatePostcode = (postcode: string, enabled = true) => {
  return useQuery({
    queryKey: ['postcodes', 'validate', postcode],
    queryFn: () => validatePostcode(postcode),
    enabled: enabled && postcode.length === 4,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for getting a specific postcode details
 */
export const useGetPostcode = (postcode: string) => {
  return useQuery({
    queryKey: ['postcodes', postcode],
    queryFn: () => getPostcode(postcode),
    enabled: postcode.length === 4,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
