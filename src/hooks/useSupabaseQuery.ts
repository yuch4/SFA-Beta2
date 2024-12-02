import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface UseSupabaseQueryOptions<T> {
  table: string;
  select?: string;
  initialData?: T[];
}

export function useSupabaseQuery<T>({ table, select = '*', initialData = [] }: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: result, error: queryError } = await supabase
        .from(table)
        .select(select);

      if (queryError) throw queryError;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [table, select]);

  return { data, loading, error, fetch };
}