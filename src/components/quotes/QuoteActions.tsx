import React from 'react';
import { Copy, FileDown, FileUp, Send, ShoppingCart } from 'lucide-react';

interface QuoteActionsProps {
  onCopy: () => void;
  onExport: () => void;
  onImport: () => void;
  onSubmit: () => void;
  onCreatePurchaseOrders: () => void;
  canSubmit: boolean;
  hasPurchaseItems: boolean;
  status: string;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  onCopy,
  onExport,
  onImport,
  onSubmit,
  onCreatePurchaseOrders,
  canSubmit,
  hasPurchaseItems,
  status,
}) => {
  // Enable submit button if:
  // 1. Form is valid (canSubmit)
  // 2. Status is DRAFT (can only submit drafts)
  // 3. Has all required data
  const isSubmitEnabled = canSubmit && status === 'DRAFT';

  return (
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
        onClick={onSubmit}
        disabled={!isSubmitEnabled}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4 mr-2" />
        承認申請
      </button>
    </div>
  );
};

export default QuoteActions;