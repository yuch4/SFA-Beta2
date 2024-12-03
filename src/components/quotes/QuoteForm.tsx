import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Quote, QuoteItem } from '../../types/quote';
import { Case } from '../../types/case';
import { Customer, Supplier, SupplierType } from '../../types/master';
import { generateQuoteNumber } from '../../utils/quoteUtils';
import { generatePurchaseOrderNumber } from '../../utils/purchaseOrderUtils';
import QuoteBasicInfo from './QuoteBasicInfo';
import QuoteItemList from './QuoteItemList';
import QuoteAttachments from './QuoteAttachments';
import QuoteActions from './QuoteActions';
import SupplierSelectionDialog from './SupplierSelectionDialog';
import { Send } from 'lucide-react';
import ApprovalFlowSelectDialog from './ApprovalFlowSelectDialog';

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: () => void;
  onCancel: () => void;
  isCopy?: boolean;
}

// 承認ステップの進捗を表示するコンポーネント
const ApprovalProgress: React.FC<{ quoteId: string }> = ({ quoteId }) => {
  const [approvalSteps, setApprovalSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const fetchApprovalProgress = async () => {
      try {
        // 承認申請情報を取得（最新のもののみ）
        const { data: requestData, error: requestError } = await supabase
          .from('approval_requests')
          .select('id, status')
          .eq('request_type', 'QUOTE')
          .eq('request_id', quoteId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (requestError) {
          if (requestError.code === 'PGRST116') {
            // データが見つからない場合は正常として扱う
            return;
          }
          throw requestError;
        }

        if (requestData) {
          // 承認ステップ情報を取得
          const { data: stepsData, error: stepsError } = await supabase
            .from('approval_request_steps')
            .select(`
              *,
              user_profiles:approver_id(
                id,
                email,
                display_name
              )
            `)
            .eq('approval_request_id', requestData.id)
            .eq('is_deleted', false)
            .order('step_order');

          if (stepsError) throw stepsError;

          setApprovalSteps(stepsData || []);
          setCurrentStep(stepsData?.findIndex(step => step.status === 'PENDING') || 0);
        }
      } catch (error) {
        console.error('Error fetching approval progress:', error);
      }
    };

    if (quoteId) {
      fetchApprovalProgress();
    }
  }, [quoteId]);

  if (approvalSteps.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">承認ステップ進捗</h3>
      <div className="flex items-center">
        {approvalSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'APPROVED'
                    ? 'bg-green-500 text-white'
                    : step.status === 'REJECTED'
                    ? 'bg-red-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <div className="text-sm mt-1">
                {step.status === 'APPROVED' ? '承認済' :
                 step.status === 'REJECTED' ? '却下' :
                 index === currentStep ? '承認待ち' : '未到達'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {step.user_profiles?.display_name || step.user_profiles?.email || '未設定'}
              </div>
            </div>
            {index < approvalSteps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const QuoteForm: React.FC<QuoteFormProps> = ({ quote, onSubmit, onCancel, isCopy = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Quote>>({
    quote_number: '',
    quote_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    delivery_date: '',
    payment_terms: '',
    subject: '',
    message: '',
    notes: '',
    internal_memo: '',
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    purchase_cost: 0,
    profit_amount: 0,
    profit_rate: 0,
    status: 'DRAFT',
  });
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCase, setSelectedCase] = useState<Case | undefined>();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          { data: casesData },
          { data: customersData },
          { data: suppliersData }
        ] = await Promise.all([
          supabase.from('cases').select('*').eq('is_deleted', false),
          supabase.from('customers').select('*').eq('is_deleted', false),
          supabase.from('suppliers').select('*').eq('is_deleted', false)
        ]);

        console.log('Fetched suppliers:', suppliersData);

        if (casesData) setCases(casesData);
        if (customersData) setCustomers(customersData);
        if (suppliersData) setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error fetching master data:', error);
        toast.error('マスターデータの取得に失敗しました');
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    const initializeForm = async () => {
      if (quote) {
        try {
          // Fetch quote items with supplier information
          const { data: itemsData, error: itemsError } = await supabase
            .from('quote_items')
            .select(`
              *,
              suppliers (
                id,
                supplier_code,
                supplier_name,
                supplier_name_kana,
                supplier_type,
                address,
                phone,
                email,
                contact_person,
                contact_phone,
                department,
                payment_terms,
                purchase_terms,
                notes,
                created_at,
                updated_at,
                created_by,
                updated_by,
                is_active,
                is_deleted
              )
            `)
            .eq('quote_id', quote.id)
            .eq('is_deleted', false)
            .order('item_order');

          if (itemsError) throw itemsError;

          // Fetch attachments
          const { data: attachmentsData, error: attachmentsError } = await supabase
            .from('quote_attachments')
            .select('*')
            .eq('quote_id', quote.id)
            .eq('is_deleted', false);

          if (attachmentsError) throw attachmentsError;

          // Set form data
          if (isCopy) {
            setFormData({
              ...formData,
              quote_number: generateQuoteNumber(),
              case_id: quote.case_id,
              customer_id: quote.customer_id,
              quote_date: new Date().toISOString().split('T')[0],
              status: 'DRAFT',
            });
          } else {
            setFormData(quote);
          }

          // Set items and attachments
          if (itemsData) setItems(itemsData);
          if (attachmentsData) setAttachments(attachmentsData);

          // Set selected case and customer
          const selectedCase = cases.find(c => c.id === quote.case_id);
          const selectedCustomer = customers.find(c => c.id === quote.customer_id);
          setSelectedCase(selectedCase);
          setSelectedCustomer(selectedCustomer);
        } catch (error) {
          console.error('Error fetching quote details:', error);
          toast.error('見積データの取得に失敗しました');
        }
      } else {
        setFormData({
          ...formData,
          quote_number: generateQuoteNumber(),
        });
      }
    };

    initializeForm();
  }, [quote, isCopy, cases, customers]);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePurchaseOrders = useCallback(async (supplierIdToUse?: string) => {
    if (!supplierIdToUse) {
      return;
    }

    try {
      console.log('Debug: Starting purchase order creation');
      setIsSubmitting(true);
      const poNumber = generatePurchaseOrderNumber();

      // Filter items for the selected supplier
      const supplierItems = items.filter(item => {
        return item.supplier_id === supplierIdToUse && item.item_type === 'NORMAL';
      });

      if (supplierItems.length === 0) {
        toast.error('選択された仕入先の商品がありません');
        setIsSubmitting(false);
        setIsSupplierDialogOpen(false);
        return;
      }

      // Calculate totals
      const subtotal = supplierItems.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.purchase_unit_price || 0),
        0
      );
      const taxAmount = subtotal * 0.1;
      const totalAmount = subtotal + taxAmount;

      // Create purchase order
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert([
          {
            po_number: poNumber,
            case_id: formData.case_id,
            quote_id: quote?.id,
            supplier_id: supplierIdToUse,
            po_date: new Date().toISOString().split('T')[0],
            delivery_date: formData.delivery_date,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: 'DRAFT',
            created_by: user?.id,
            updated_by: user?.id,
          },
        ])
        .select()
        .single();

      if (poError) throw poError;

      // Create purchase order items
      const poItems = supplierItems.map((item, index) => ({
        po_id: poData.id,
        item_order: index + 1,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.purchase_unit_price,
        amount: (item.quantity || 0) * (item.purchase_unit_price || 0),
        quote_item_id: item.id,
        created_by: user?.id,
        updated_by: user?.id,
      }));

      const { error: poItemsError } = await supabase
        .from('purchase_order_items')
        .insert(poItems);

      if (poItemsError) throw poItemsError;

      // 発注書作成成功後の処理
      const poId = poData.id;
      console.log('Debug: Purchase order created with ID:', poId);
      console.log('Debug: Current location before navigation:', window.location.pathname);
      
      // 状態をクリア
      setIsSubmitting(false);
      setIsSupplierDialogOpen(false);
      setSelectedSupplier('');
      
      // トースト表示
      toast.success('発注書を作成しました');

      // フォームのクリーンアップ
      onSubmit();
      
      // 最後にナゲーションを実行
      console.log('Debug: Attempting navigation to:', `/purchase-orders/${poId}`);
      navigate(`/purchase-orders/${poId}`, { replace: true });
      console.log('Debug: Navigation called');

    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('発注書の作成に失敗しました');
      setIsSubmitting(false);
      setIsSupplierDialogOpen(false);
      setSelectedSupplier('');
    }
  }, [navigate, items, formData, quote, user]);

  // 現在のロケーション変更を監視
  useEffect(() => {
    console.log('Debug: Current location changed:', window.location.pathname);
  }, [window.location.pathname]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 保存用のデータを準備
      const quoteData = {
        quote_number: formData.quote_number,
        case_id: formData.case_id,
        quote_date: formData.quote_date,
        valid_until: formData.valid_until,
        customer_id: formData.customer_id,
        payment_terms: formData.payment_terms,
        delivery_date: formData.delivery_date,
        subtotal: formData.subtotal,
        tax_amount: formData.tax_amount,
        total_amount: formData.total_amount,
        purchase_cost: formData.purchase_cost,
        profit_amount: formData.profit_amount,
        profit_rate: formData.profit_rate,
        subject: formData.subject,
        message: formData.message,
        notes: formData.notes,
        internal_memo: formData.internal_memo,
        status: formData.status,
        updated_by: user?.id,
      };

      if (quote) {
        // 更新の場合
        const { error: updateError } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', quote.id);

        if (updateError) throw updateError;

        // 既存の明細を物理削除
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', quote.id);

        if (deleteError) throw deleteError;

        // 新しい明細を挿入
        const itemsToUpdate = items.map((item, index) => ({
          id: crypto.randomUUID(), // 新しいIDを生成
          quote_id: quote.id,
          item_order: index + 1,
          item_type: item.item_type,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          supplier_id: item.supplier_id,
          purchase_unit_price: item.purchase_unit_price,
          amount: item.amount,
          is_tax_applicable: item.is_tax_applicable,
          created_by: user?.id,
          updated_by: user?.id,
          is_active: true,
          is_deleted: false,
        }));

        const { error: insertError } = await supabase
          .from('quote_items')
          .insert(itemsToUpdate);

        if (insertError) throw insertError;
      } else {
        // 新規作成の場合
        const { data: newQuote, error: insertError } = await supabase
          .from('quotes')
          .insert([{
            ...quoteData,
            created_by: user?.id,
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // 明細の作成
        const itemsToCreate = items.map((item, index) => ({
          id: crypto.randomUUID(),
          quote_id: newQuote.id,
          item_order: index + 1,
          item_type: item.item_type,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          supplier_id: item.supplier_id,
          purchase_unit_price: item.purchase_unit_price,
          amount: item.amount,
          is_tax_applicable: item.is_tax_applicable,
          created_by: user?.id,
          updated_by: user?.id,
          is_active: true,
          is_deleted: false,
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsToCreate);

        if (itemsError) throw itemsError;
      }

      toast.success('見積書を保存しました');
      onSubmit();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('見積書の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 仕入先ごとに明細をグループ化する関数
  const groupItemsBySupplier = () => {
    const groupedItems: Record<string, { supplier: Supplier; items: QuoteItem[] }> = {};
    
    items.forEach(item => {
      if (item.supplier_id && item.item_type === 'NORMAL') {
        const supplierInfo = suppliers.find(s => s.id === item.supplier_id);
        if (supplierInfo) {
          if (!groupedItems[item.supplier_id]) {
            groupedItems[item.supplier_id] = {
              supplier: supplierInfo,
              items: []
            };
          }
          groupedItems[item.supplier_id].items.push(item);
        }
      }
    });
    
    console.log('Grouped items:', groupedItems);
    return groupedItems;
  };

  // コンポーネントのアンマウント時のデバッグ
  useEffect(() => {
    return () => {
      console.log('Debug: QuoteForm unmounting with location:', window.location.pathname);
      console.log('Debug: Navigation state at unmount:', window.history.state);
    };
  }, []);

  // 承認フロー選択時のハンドラー
  const handleApprovalFlowSelect = async (flowId: string) => {
    try {
      if (!quote?.id) return;

      // 承認申請を作成
      const { error: requestError } = await supabase
        .from('approval_requests')
        .insert({
          approval_flow_id: flowId,
          request_type: 'QUOTE',
          request_id: quote.id,
          status: 'PENDING',
          requested_by: user?.id,
          created_by: user?.id,
          updated_by: user?.id,
        });

      if (requestError) throw requestError;

      // 見積のステータスを「承認中」に更新
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          status: 'PENDING',
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      // ダイアログを閉じる
      setIsApprovalDialogOpen(false);
      
      // 成功メッセージを表示
      toast.success('承認申請を作成しました');

      // 画面を更新
      window.location.reload();
    } catch (error) {
      console.error('Error submitting approval request:', error);
      toast.error('承認申請の作成に失敗しました');
    }
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <QuoteBasicInfo
          formData={formData}
          selectedCase={selectedCase}
          selectedCustomer={selectedCustomer}
          cases={cases}
          customers={customers}
          errors={errors}
          onFieldChange={handleFieldChange}
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
          onItemsChange={setItems}
        />

        <QuoteAttachments
          quoteId={quote?.id || ''}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />

        <div className="flex justify-end space-x-4">
          {quote && quote.status === 'DRAFT' && (
            <button
              type="button"
              onClick={() => setIsApprovalDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Send className="h-4 w-4 mr-2" />
              承認申請
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            保存
          </button>
        </div>

        <ApprovalFlowSelectDialog
          isOpen={isApprovalDialogOpen}
          onClose={() => setIsApprovalDialogOpen(false)}
          onSelect={handleApprovalFlowSelect}
        />
      </form>

      {quote?.id && <ApprovalProgress quoteId={quote.id} />}

      <div className="mt-4">
        <QuoteActions
          quoteId={quote?.id || ''}
          onCopy={() => {}}
          onExport={() => {}}
          onImport={() => {}}
          onCreatePurchaseOrders={() => {
            setIsSupplierDialogOpen(true);
          }}
          canSubmit={true}
          hasPurchaseItems={items.some(item => item.supplier_id && item.purchase_unit_price > 0)}
          status={formData.status || 'DRAFT'}
        />
      </div>

      <SupplierSelectionDialog
        isOpen={isSupplierDialogOpen}
        onClose={() => setIsSupplierDialogOpen(false)}
        onSubmit={(selectedSuppliers: string[]) => {
          if (selectedSuppliers.length > 0) {
            handleCreatePurchaseOrders(selectedSuppliers[0]);
          }
        }}
        suppliers={groupItemsBySupplier()}
      />
    </>
  );
};

export default QuoteForm;