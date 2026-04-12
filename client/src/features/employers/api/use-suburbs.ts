import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/react-query';

import { getSuburb, searchSuburbs } from './suburbs';

export const useSearchSuburbs = (query: string) => {
  return useQuery({
    queryKey: queryKeys.suburbs.search(query),
    queryFn: () => searchSuburbs(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetSuburb = (id: number | undefined) => {
  return useQuery({
    queryKey: queryKeys.suburbs.detail(id!),
    queryFn: () => getSuburb(id!),
    enabled: !!id && id > 0,
    staleTime: 10 * 60 * 1000,
  });
};
