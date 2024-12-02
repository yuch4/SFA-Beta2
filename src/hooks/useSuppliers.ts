import { useState, useCallback } from 'react';
import { Supplier } from '../types/master';
import { supabase } from '../lib/supabase';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('suppliers')
        .select('*')
        .order('supplier_code', { ascending: true });

      if (supabaseError) throw supabaseError;
      setSuppliers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch suppliers'));
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSupplier = async (supplierId: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_deleted: true })
        .eq('id', supplierId);

      if (error) throw error;
      await fetchSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete supplier'));
      console.error('Error deleting supplier:', err);
    }
  };

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    deleteSupplier,
  };
};