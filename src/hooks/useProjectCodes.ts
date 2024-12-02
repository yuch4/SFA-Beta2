import { useState, useCallback } from 'react';
import { ProjectCode } from '../types/master';
import { supabase } from '../lib/supabase';

export const useProjectCodes = () => {
  const [projectCodes, setProjectCodes] = useState<ProjectCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjectCodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('project_codes')
        .select('*')
        .order('project_code', { ascending: true });

      if (supabaseError) throw supabaseError;
      setProjectCodes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch project codes'));
      console.error('Error fetching project codes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProjectCode = async (projectCodeId: string) => {
    try {
      const { error } = await supabase
        .from('project_codes')
        .update({ is_deleted: true })
        .eq('id', projectCodeId);

      if (error) throw error;
      await fetchProjectCodes();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project code'));
      console.error('Error deleting project code:', err);
    }
  };

  return {
    projectCodes,
    loading,
    error,
    fetchProjectCodes,
    deleteProjectCode,
  };
};