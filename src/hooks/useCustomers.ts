import { useState, useCallback } from 'react';
import { Customer } from '../types/master';
import { supabase } from '../lib/supabase';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_deleted', false)
        .order('customer_code', { ascending: true });

      if (supabaseError) throw supabaseError;
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete customer'));
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    deleteCustomer,
  };
};