import { useState, useCallback } from 'react';
import { PurchaseOrder, PurchaseOrderListView } from '../types/purchase-order';
import { supabase } from '../lib/supabase';

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderListView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          case_id,
          cases:case_id!inner (
            case_name
          ),
          quote_id,
          quotes:quote_id (
            quote_number
          ),
          supplier_id,
          suppliers:supplier_id!inner (
            supplier_name
          ),
          po_date,
          delivery_date,
          total_amount,
          status,
          version,
          updated_at
        `)
        .eq('is_deleted', false)
        .order('po_number', { ascending: false });

      if (supabaseError) throw supabaseError;

      const formattedPurchaseOrders = data?.map(po => ({
        id: po.id,
        po_number: po.po_number,
        case_name: po.cases?.case_name || '',
        quote_number: po.quotes?.quote_number,
        supplier_name: po.suppliers?.supplier_name || '',
        po_date: po.po_date,
        delivery_date: po.delivery_date,
        total_amount: po.total_amount,
        status: po.status,
        version: po.version,
        updated_at: po.updated_at,
      })) || [];

      setPurchaseOrders(formattedPurchaseOrders);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch purchase orders'));
      console.error('Error fetching purchase orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPurchaseOrderById = async (id: string) => {
    try {
      // First fetch the purchase order
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          cases:case_id!inner (*),
          quotes:quote_id (*),
          suppliers:supplier_id!inner (*)
        `)
        .eq('id', id)
        .single();

      if (poError) throw poError;

      // Then fetch the items separately
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('po_id', id)
        .eq('is_deleted', false)
        .order('item_order');

      if (itemsError) throw itemsError;

      // Combine the data
      return {
        ...poData,
        purchase_order_items: itemsData || []
      };
    } catch (err) {
      console.error('Error fetching purchase order:', err);
      throw err;
    }
  };

  const deletePurchaseOrder = async (poId: string) => {
    try {
      // Start a transaction
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', poId);

      if (poError) throw poError;

      // Mark all purchase order items as deleted
      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('po_id', poId);

      if (itemsError) throw itemsError;

      await fetchPurchaseOrders();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete purchase order'));
      console.error('Error deleting purchase order:', err);
      throw err;
    }
  };

  return {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    fetchPurchaseOrderById,
    deletePurchaseOrder,
  };
};