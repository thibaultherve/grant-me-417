import { useQuery } from '@tanstack/react-query';

import { getSuburb, searchSuburbs } from './suburbs';

export const useSearchSuburbs = (query: string) => {
  return useQuery({
    queryKey: ['suburbs', 'search', query],
    queryFn: () => searchSuburbs(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetSuburb = (id: number | undefined) => {
  return useQuery({
    queryKey: ['suburbs', id],
    queryFn: () => getSuburb(id!),
    enabled: !!id && id > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
