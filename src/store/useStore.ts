import { create } from 'zustand';
import { Opportunity, Quote, PurchaseOrder, Customer } from '../types';
import { supabase } from '../lib/supabase';

interface Store {
  opportunities: Opportunity[];
  quotes: Quote[];
  purchaseOrders: PurchaseOrder[];
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  fetchOpportunities: () => Promise<void>;
  fetchQuotes: () => Promise<void>;
  fetchPurchaseOrders: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
}

export const useStore = create<Store>((set) => ({
  opportunities: [],
  quotes: [],
  purchaseOrders: [],
  customers: [],
  loading: false,
  error: null,

  fetchOpportunities: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.from('opportunities').select('*');
      if (error) throw error;
      set({ opportunities: data || [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error('Failed to fetch opportunities'), loading: false });
    }
  },

  fetchQuotes: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.from('quotes').select('*');
      if (error) throw error;
      set({ quotes: data || [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error('Failed to fetch quotes'), loading: false });
    }
  },

  fetchPurchaseOrders: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.from('purchase_orders').select('*');
      if (error) throw error;
      set({ purchaseOrders: data || [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error('Failed to fetch purchase orders'), loading: false });
    }
  },

  fetchCustomers: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;
      set({ customers: data || [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error('Failed to fetch customers'), loading: false });
    }
  },
}));