import { useState, useEffect } from 'react';
import { getHours, type GetHoursOptions } from '../api/get-hours';
import type { HoursResponse } from '../types';

export const useHours = (options: GetHoursOptions = {}) => {
  const [data, setData] = useState<HoursResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getHours(options);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch hours'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHours();
  }, [options.page, options.limit, options.sort?.field, options.sort?.order]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getHours(options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refetch hours'));
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