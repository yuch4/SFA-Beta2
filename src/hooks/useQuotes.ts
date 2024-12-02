import { useState, useCallback } from 'react';
import { Quote, QuoteListView } from '../types/quote';
import { supabase } from '../lib/supabase';

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteListView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('quotes')
        .select(`
          id,
          quote_number,
          case_id,
          cases (
            id,
            case_number,
            case_name
          ),
          customer_id,
          customers (
            id,
            customer_code,
            customer_name
          ),
          quote_date,
          valid_until,
          total_amount,
          profit_rate,
          status,
          version,
          updated_at
        `)
        .eq('is_deleted', false)
        .order('quote_number', { ascending: false });

      if (supabaseError) throw supabaseError;

      const formattedQuotes = data?.map(quote => ({
        id: quote.id,
        quote_number: quote.quote_number,
        case_id: quote.case_id,
        case_name: quote.cases?.case_name || '',
        customer_id: quote.customer_id,
        customer_name: quote.customers?.customer_name || '',
        quote_date: quote.quote_date,
        valid_until: quote.valid_until,
        total_amount: quote.total_amount,
        profit_rate: quote.profit_rate,
        status: quote.status,
        version: quote.version,
        updated_at: quote.updated_at,
      })) || [];

      setQuotes(formattedQuotes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quotes'));
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuoteById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          cases:case_id (*),
          customers:customer_id (*),
          quote_items (*)
        `)
        .eq('id', id)
        .eq('quote_items.is_deleted', false)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching quote:', err);
      throw err;
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      // Start a transaction
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      // Mark all quote items as deleted
      const { error: itemsError } = await supabase
        .from('quote_items')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('quote_id', quoteId);

      if (itemsError) throw itemsError;

      await fetchQuotes();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete quote'));
      console.error('Error deleting quote:', err);
      throw err;
    }
  };

  return {
    quotes,
    loading,
    error,
    fetchQuotes,
    fetchQuoteById,
    deleteQuote,
  };
};