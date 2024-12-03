import React, { useState } from 'react';
import { Copy, FileDown, FileUp, Send, ShoppingCart } from 'lucide-react';
import { useApprovalRequests } from '../../hooks/useApprovalRequests';
import ApprovalFlowSelectDialog from './ApprovalFlowSelectDialog';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface QuoteActionsProps {
  quoteId: string;
  onCopy: () => void;
  onExport: () => void;
  onImport: () => void;
  onCreatePurchaseOrders: () => void;
  canSubmit: boolean;
  hasPurchaseItems: boolean;
  status: string;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  quoteId,
  onCopy,
  onExport,
  onImport,
  onCreatePurchaseOrders,
  canSubmit,
  hasPurchaseItems,
  status,
}) => {
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const { createApprovalRequest, loading } = useApprovalRequests();

  // 承認申請が可能な状態かどうかを判定
  const isSubmitEnabled = canSubmit && status === 'DRAFT';

  const handleSubmit = async () => {
    setIsApprovalDialogOpen(true);
  };

  const handleApprovalFlowSelect = async (flowId: string) => {
    try {
      // 承認申請を作成
      await createApprovalRequest(flowId, 'QUOTE', quoteId);

      // 見積のステータスを「承認中」に更新
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'PENDING' })
        .eq('id', quoteId);

      if (updateError) throw updateError;

      // ダイアログを閉じる
      setIsApprovalDialogOpen(false);
      
      // 成功メッセージを表示
      toast.success('承認申請を作成しました');

      // 画面を更新（必要に応じて）
      window.location.reload();
    } catch (error) {
      console.error('Error submitting approval request:', error);
      toast.error('承認申請の作成に失敗しました');
    }
  };

  return (
    <>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Copy className="h-4 w-4 mr-2" />
          コピーして新規作成
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FileDown className="h-4 w-4 mr-2" />
          エクスポート
        </button>
        <button
          type="button"
          onClick={onImport}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FileUp className="h-4 w-4 mr-2" />
          インポート
        </button>
        {hasPurchaseItems && (
          <button
            type="button"
            onClick={onCreatePurchaseOrders}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            発注書作成
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isSubmitEnabled || loading}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? '処理中...' : '承認申請'}
        </button>
      </div>

      <ApprovalFlowSelectDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onSelect={handleApprovalFlowSelect}
      />
    </>
  );
};

export default QuoteActions;