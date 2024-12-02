import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Case } from '../../types/case';
import { Customer, Supplier } from '../../types/master';
import { Quote, QuoteItem, QuoteHistory, QuoteAttachment } from '../../types/quote';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { generateQuoteNumber, calculateTotals } from '../../utils/quoteUtils';
import { initializeQuoteForm } from '../../utils/formUtils';
import QuoteBasicInfo from './QuoteBasicInfo';
import QuoteItemList from './QuoteItemList';
import QuoteRevisionDialog from './QuoteRevisionDialog';
import QuoteRevisionHistory from './QuoteRevisionHistory';
import QuoteAttachments from './QuoteAttachments';
import QuoteActions from './QuoteActions';
import SupplierSelectionDialog from './SupplierSelectionDialog';

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: () => void;
  onCancel: () => void;
  isCopy?: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ quote, onSubmit, onCancel, isCopy = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | undefined>();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [attachments, setAttachments] = useState<QuoteAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState<QuoteHistory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<Quote>>(initializeQuoteForm(quote));
  const [supplierGroups, setSupplierGroups] = useState<Record<string, { supplier: Supplier; items: QuoteItem[] }>>({});

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          { data: casesData },
          { data: customersData },
          { data: suppliersData }
        ] = await Promise.all([
          supabase.from('cases').select('*').eq('is_active', true),
          supabase.from('customers').select('*').eq('is_active', true),
          supabase.from('suppliers').select('*').eq('is_active', true)
        ]);

        setCases(casesData || []);
        setCustomers(customersData || []);
        setSuppliers(suppliersData || []);

        if (quote) {
          const selectedCase = casesData?.find(c => c.id === quote.case_id);
          const selectedCustomer = customersData?.find(c => c.id === quote.customer_id);
          setSelectedCase(selectedCase);
          setSelectedCustomer(selectedCustomer);

          // Fetch quote items
          const { data: itemsData } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', quote.id)
            .eq('is_deleted', false)
            .order('item_order');

          if (itemsData) {
            setItems(itemsData);
          }

          // Fetch quote history
          const { data: historyData } = await supabase
            .from('quote_histories')
            .select('*')
            .eq('quote_id', quote.id)
            .order('changed_at', { ascending: false });

          if (historyData) {
            setQuoteHistory(historyData);
          }

          // Fetch attachments
          const { data: attachmentsData } = await supabase
            .from('quote_attachments')
            .select('*')
            .eq('quote_id', quote.id)
            .eq('is_deleted', false);

          if (attachmentsData) {
            setAttachments(attachmentsData);
          }
        }
      } catch (error) {
        console.error('Error fetching master data:', error);
        toast.error('データの取得に失敗しました');
      }
    };

    fetchMasterData();
  }, [quote]);

  const handleCreatePurchaseOrders = async () => {
    // Group items by supplier
    const itemsBySupplier = items.reduce((acc: Record<string, { supplier: Supplier; items: QuoteItem[] }>, item) => {
      if (!item.supplier_id) return acc;
      const supplier = suppliers.find(s => s.id === item.supplier_id);
      if (!supplier) return acc;
      
      if (!acc[item.supplier_id]) {
        acc[item.supplier_id] = {
          supplier,
          items: [],
        };
      }
      acc[item.supplier_id].items.push(item);
      return acc;
    }, {});

    if (Object.keys(itemsBySupplier).length === 0) {
      toast.error('仕入先が設定されている明細がありません');
      return;
    }

    setSupplierGroups(itemsBySupplier);
    setIsSupplierDialogOpen(true);
  };

  const handleSupplierSelection = async (selectedSuppliers: string[]) => {
    try {
      setIsSubmitting(true);
      
      for (const supplierId of selectedSuppliers) {
        const supplierGroup = supplierGroups[supplierId];
        if (!supplierGroup) continue;

        const poNumber = generateQuoteNumber('PO');
        const poItems = supplierGroup.items.map((item, index) => ({
          id: crypto.randomUUID(),
          item_order: index + 1,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.purchase_unit_price,
          amount: item.quantity * item.purchase_unit_price,
          quote_item_id: item.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id,
          updated_by: user?.id,
          is_active: true,
          is_deleted: false,
        }));

        const totals = poItems.reduce(
          (acc, item) => ({
            subtotal: acc.subtotal + item.amount,
            tax_amount: acc.tax_amount + item.amount * 0.1,
            total_amount: acc.total_amount + item.amount * 1.1,
          }),
          { subtotal: 0, tax_amount: 0, total_amount: 0 }
        );

        const poPayload = {
          po_number: poNumber,
          case_id: formData.case_id,
          quote_id: quote?.id,
          supplier_id: supplierId,
          po_date: new Date().toISOString().split('T')[0],
          delivery_date: formData.delivery_date,
          payment_terms: formData.payment_terms,
          ...totals,
          status: 'DRAFT',
          version: 1,
          created_by: user?.id,
          updated_by: user?.id,
          is_active: true,
          is_deleted: false,
        };

        const { data: poData, error: poError } = await supabase
          .from('purchase_orders')
          .insert([poPayload])
          .select()
          .single();

        if (poError) throw poError;

        const itemsToInsert = poItems.map(item => ({
          ...item,
          po_id: poData.id,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast.success('発注書を作成しました');
      setIsSupplierDialogOpen(false);
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase orders:', error);
      toast.error('発注書の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (quote && !isCopy) {
      setIsRevisionDialogOpen(true);
      return;
    }

    await handleSubmit();
  };

  const handleRevisionSubmit = async (reason: string, notes: string) => {
    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      const newVersion = (quote?.version || 1) + 1;

      // Update quote with new version and revision info
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          ...formData,
          version: newVersion,
          revision_reason: reason,
          revision_notes: notes,
          updated_at: now,
          updated_by: user?.id,
        })
        .eq('id', quote?.id);

      if (quoteError) throw quoteError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('quote_items')
        .update({ is_deleted: true })
        .eq('quote_id', quote?.id);

      if (deleteError) throw deleteError;

      // Insert new items
      const itemsToInsert = items.map(item => ({
        ...item,
        quote_id: quote?.id,
        created_by: user?.id,
        updated_by: user?.id,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('見積書を更新しました');
      setIsRevisionDialogOpen(false);
      onSubmit();
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('見積書の更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      const quoteNumber = generateQuoteNumber();

      const quotePayload = {
        ...formData,
        quote_number: quoteNumber,
        created_by: user?.id,
        updated_by: user?.id,
      };

      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert([quotePayload])
        .select()
        .single();

      if (quoteError) throw quoteError;

      const itemsToInsert = items.map(item => ({
        ...item,
        quote_id: quoteData.id,
        created_by: user?.id,
        updated_by: user?.id,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('見積書を作成しました');
      onSubmit();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('見積書の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <QuoteBasicInfo
          formData={formData}
          selectedCase={selectedCase}
          selectedCustomer={selectedCustomer}
          cases={cases}
          customers={customers}
          errors={errors}
          onFieldChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          onCaseSelect={(caseItem) => {
            setSelectedCase(caseItem);
            setFormData(prev => ({ ...prev, case_id: caseItem.id }));
          }}
          onCustomerSelect={(customer) => {
            setSelectedCustomer(customer);
            setFormData(prev => ({ ...prev, customer_id: customer.id }));
          }}
        />

        <QuoteItemList
          items={items}
          suppliers={suppliers}
          onItemsChange={(newItems) => {
            setItems(newItems);
            const totals = calculateTotals(newItems);
            setFormData(prev => ({ ...prev, ...totals }));
          }}
        />

        <QuoteAttachments
          quoteId={quote?.id || ''}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />

        {quote && !isCopy && quoteHistory.length > 0 && (
          <QuoteRevisionHistory history={quoteHistory} />
        )}

        <div className="flex justify-between pt-6 border-t">
          <QuoteActions
            onCopy={() => {}}
            onExport={() => {}}
            onImport={() => {}}
            onCreatePurchaseOrders={handleCreatePurchaseOrders}
            onSubmit={() => {}}
            canSubmit={false}
            hasPurchaseItems={items.some(item => item.supplier_id && item.purchase_unit_price > 0)}
          />

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : quote && !isCopy ? '更新' : '作成'}
            </button>
          </div>
        </div>
      </form>

      <QuoteRevisionDialog
        isOpen={isRevisionDialogOpen}
        onClose={() => setIsRevisionDialogOpen(false)}
        onSubmit={handleRevisionSubmit}
        isSubmitting={isSubmitting}
      />

      <SupplierSelectionDialog
        isOpen={isSupplierDialogOpen}
        onClose={() => setIsSupplierDialogOpen(false)}
        onSubmit={handleSupplierSelection}
        suppliers={supplierGroups}
      />
    </div>
  );
};

export default QuoteForm;