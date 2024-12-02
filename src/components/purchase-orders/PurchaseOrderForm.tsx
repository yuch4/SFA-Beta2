import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Case } from '../../types/case';
import { Quote } from '../../types/quote';
import { Supplier } from '../../types/master';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../../types/purchase-order';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { 
  generatePurchaseOrderNumber, 
  calculatePurchaseOrderTotals,
  initializePurchaseOrderForm,
  initializePurchaseOrderItem,
  convertQuoteItemToPurchaseOrderItem
} from '../../utils/purchaseOrderUtils';
import PurchaseOrderBasicInfo from './PurchaseOrderBasicInfo';
import PurchaseOrderItemList from './PurchaseOrderItemList';
import PurchaseOrderAttachments from './PurchaseOrderAttachments';
import PurchaseOrderActions from './PurchaseOrderActions';

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder;
  onSubmit: () => void;
  onCancel: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ 
  purchaseOrder, 
  onSubmit, 
  onCancel 
}) => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | undefined>();
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>(
    initializePurchaseOrderForm(purchaseOrder)
  );

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          { data: casesData },
          { data: quotesData },
          { data: suppliersData }
        ] = await Promise.all([
          supabase.from('cases').select('*').eq('is_active', true),
          supabase.from('quotes').select('*').eq('is_active', true),
          supabase.from('suppliers').select('*').eq('is_active', true)
        ]);

        setCases(casesData || []);
        setQuotes(quotesData || []);
        setSuppliers(suppliersData || []);

        if (purchaseOrder) {
          const selectedCase = casesData?.find(c => c.id === purchaseOrder.case_id);
          const selectedQuote = quotesData?.find(q => q.id === purchaseOrder.quote_id);
          const selectedSupplier = suppliersData?.find(s => s.id === purchaseOrder.supplier_id);
          
          setSelectedCase(selectedCase);
          setSelectedQuote(selectedQuote);
          setSelectedSupplier(selectedSupplier);

          // Fetch purchase order items
          const { data: itemsData } = await supabase
            .from('purchase_order_items')
            .select('*')
            .eq('po_id', purchaseOrder.id)
            .eq('is_deleted', false)
            .order('item_order');

          if (itemsData) {
            setItems(itemsData);
          }

          // Fetch attachments
          const { data: attachmentsData } = await supabase
            .from('purchase_order_attachments')
            .select('*')
            .eq('po_id', purchaseOrder.id)
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
  }, [purchaseOrder]);

  const handleQuoteSelect = async (quote: Quote) => {
    try {
      setSelectedQuote(quote);
      setFormData(prev => ({ ...prev, quote_id: quote.id }));

      const { data: quoteItems, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .eq('is_deleted', false)
        .order('item_order');

      if (itemsError) throw itemsError;

      const poItems = quoteItems
        .filter(item => item.supplier_id === selectedSupplier?.id)
        .map((item, index) => convertQuoteItemToPurchaseOrderItem(item, index));

      setItems(poItems);

      const totals = calculatePurchaseOrderTotals(poItems);
      setFormData(prev => ({ ...prev, ...totals }));
    } catch (error) {
      console.error('Error loading quote items:', error);
      toast.error('見積明細の読み込みに失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      if (purchaseOrder) {
        const { error: poError } = await supabase
          .from('purchase_orders')
          .update({
            ...formData,
            updated_at: now,
            updated_by: user?.id,
          })
          .eq('id', purchaseOrder.id);

        if (poError) throw poError;

        const { error: deleteError } = await supabase
          .from('purchase_order_items')
          .update({ is_deleted: true })
          .eq('po_id', purchaseOrder.id);

        if (deleteError) throw deleteError;

        const itemsToInsert = items.map(item => ({
          ...initializePurchaseOrderItem(item.item_order),
          po_id: purchaseOrder.id,
          quote_item_id: item.quote_item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          amount: item.amount,
          created_by: user?.id,
          updated_by: user?.id,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast.success('発注書を更新しました');
      } else {
        const poPayload = {
          ...formData,
          po_number: generatePurchaseOrderNumber(),
          created_by: user?.id,
          updated_by: user?.id,
        };

        const { data: poData, error: poError } = await supabase
          .from('purchase_orders')
          .insert([poPayload])
          .select()
          .single();

        if (poError) throw poError;

        const itemsToInsert = items.map(item => ({
          ...initializePurchaseOrderItem(item.item_order),
          po_id: poData.id,
          quote_item_id: item.quote_item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          amount: item.amount,
          created_by: user?.id,
          updated_by: user?.id,
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast.success('発注書を作成しました');
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast.error('発注書の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (status: PurchaseOrderStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PurchaseOrderBasicInfo
          formData={formData}
          selectedCase={selectedCase}
          selectedQuote={selectedQuote}
          selectedSupplier={selectedSupplier}
          cases={cases}
          quotes={quotes}
          suppliers={suppliers}
          errors={errors}
          onFieldChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          onCaseSelect={(caseItem) => {
            setSelectedCase(caseItem);
            setFormData(prev => ({ ...prev, case_id: caseItem.id }));
          }}
          onQuoteSelect={handleQuoteSelect}
          onSupplierSelect={(supplier) => {
            setSelectedSupplier(supplier);
            setFormData(prev => ({ ...prev, supplier_id: supplier.id }));
          }}
          onStatusChange={handleStatusChange}
        />

        <PurchaseOrderItemList
          items={items}
          onItemsChange={(newItems) => {
            setItems(newItems);
            const totals = calculatePurchaseOrderTotals(newItems);
            setFormData(prev => ({ ...prev, ...totals }));
          }}
        />

        <PurchaseOrderAttachments
          poId={purchaseOrder?.id || ''}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />

        <div className="flex justify-between pt-6 border-t">
          <PurchaseOrderActions
            onExport={() => {}}
            onImport={() => {}}
            onSubmit={() => {}}
            canSubmit={false}
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
              {isSubmitting ? '保存中...' : purchaseOrder ? '更新' : '作成'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;