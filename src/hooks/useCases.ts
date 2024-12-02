import { useState, useCallback } from 'react';
import { Case, CaseListView } from '../types/case';
import { supabase } from '../lib/supabase';

export const useCases = () => {
  const [cases, setCases] = useState<CaseListView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('cases')
        .select(`
          id,
          case_number,
          case_name,
          customer_id,
          customers (
            id,
            customer_code,
            customer_name,
            customer_type
          ),
          project_code_id,
          project_codes (
            id,
            project_code,
            project_name
          ),
          expected_revenue,
          expected_profit,
          status_id,
          statuses (
            id,
            status_code,
            status_name,
            color_settings
          ),
          probability,
          expected_order_date,
          expected_accounting_date,
          user_profiles!cases_assigned_to_fkey (
            display_name
          ),
          description,
          notes,
          updated_at
        `)
        .eq('is_deleted', false)
        .order('case_number', { ascending: true });

      if (supabaseError) throw supabaseError;

      const formattedCases = data?.map(caseItem => ({
        id: caseItem.id,
        case_number: caseItem.case_number,
        case_name: caseItem.case_name,
        customer_id: caseItem.customer_id,
        customer: caseItem.customers,
        project_code_id: caseItem.project_code_id,
        project_code: caseItem.project_codes,
        expected_revenue: caseItem.expected_revenue,
        expected_profit: caseItem.expected_profit,
        status_id: caseItem.status_id,
        status: caseItem.statuses,
        probability: caseItem.probability,
        expected_order_date: caseItem.expected_order_date,
        expected_accounting_date: caseItem.expected_accounting_date,
        assigned_to_name: caseItem.user_profiles?.display_name || '',
        description: caseItem.description,
        notes: caseItem.notes,
        updated_at: caseItem.updated_at,
      })) || [];

      setCases(formattedCases);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cases'));
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCase = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;
      await fetchCases();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete case'));
      console.error('Error deleting case:', err);
      throw err;
    }
  };

  return {
    cases,
    loading,
    error,
    fetchCases,
    deleteCase,
  };
};