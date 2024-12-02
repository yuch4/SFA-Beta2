import { useState, useCallback } from 'react';
import { Status } from '../types/master';
import { supabase } from '../lib/supabase';

export const useStatuses = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('statuses')
        .select('*')
        .order('display_order', { ascending: true });

      if (supabaseError) throw supabaseError;
      setStatuses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch statuses'));
      console.error('Error fetching statuses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStatus = async (statusId: string) => {
    try {
      const { error } = await supabase
        .from('statuses')
        .update({ is_deleted: true })
        .eq('id', statusId);

      if (error) throw error;
      await fetchStatuses();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete status'));
      console.error('Error deleting status:', err);
    }
  };

  return {
    statuses,
    loading,
    error,
    fetchStatuses,
    deleteStatus,
  };
};