import React from 'react';
import { FileDown, FileUp, Send } from 'lucide-react';

interface PurchaseOrderActionsProps {
  onExport: () => void;
  onImport: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  status: string;
}

const PurchaseOrderActions: React.FC<PurchaseOrderActionsProps> = ({
  onExport,
  onImport,
  onSubmit,
  canSubmit,
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

export default PurchaseOrderActions;