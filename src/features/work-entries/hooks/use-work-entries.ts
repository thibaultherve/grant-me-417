import { useState, useEffect } from 'react';
import { getWorkEntries, type GetWorkEntriesOptions } from '../api/get-work-entries';
import type { WorkEntriesResponse } from '../types';

export const useWorkEntries = (options: GetWorkEntriesOptions = {}) => {
  const [data, setData] = useState<WorkEntriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWorkEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getWorkEntries(options);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch work entries'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkEntries();
  }, [options.page, options.limit, options.sort?.field, options.sort?.order]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getWorkEntries(options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refetch work entries'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};