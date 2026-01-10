import { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';

import { useVisaContext } from './use-visa-context';

export interface WeeklyProgressData {
  id: string;
  user_visa_id: string;
  week_start_date: string;
  week_end_date: string;
  hours: number;
  eligible_hours: number;
  eligible_days: number;
  days_worked: number;
  created_at: string;
  updated_at: string;
}

export function useVisaWeeklyProgress() {
  const { currentVisa } = useVisaContext();
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyProgress = async () => {
    if (!currentVisa) {
      setWeeklyProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('visa_weekly_progress')
        .select('*')
        .eq('user_visa_id', currentVisa.id)
        .order('week_start_date', { ascending: true });

      if (error) throw error;

      setWeeklyProgress(data || []);
    } catch (err) {
      console.error('Error fetching weekly progress:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch weekly progress',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVisa?.id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentVisa) return;

    const channel = supabase
      .channel(`visa_weekly_progress:${currentVisa.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visa_weekly_progress',
          filter: `user_visa_id=eq.${currentVisa.id}`,
        },
        () => {
          fetchWeeklyProgress();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVisa?.id]);

  return {
    weeklyProgress,
    loading,
    error,
    refetch: fetchWeeklyProgress,
  };
}
