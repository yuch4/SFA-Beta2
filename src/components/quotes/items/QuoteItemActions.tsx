import React from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';

interface QuoteItemActionsProps {
  onAddItem: () => void;
  onAddSubtotal: () => void;
  onAddDiscount: () => void;
}

const QuoteItemActions: React.FC<QuoteItemActionsProps> = ({
  onAddItem,
  onAddSubtotal,
  onAddDiscount,
}) => {
  return (
    <div className="flex space-x-2">
      <button
        type="button"
        onClick={onAddItem}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </button>
      <button
        type="button"
        onClick={onAddSubtotal}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Add Subtotal
      </button>
      <button
        type="button"
        onClick={onAddDiscount}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Add Discount
      </button>
    </div>
  );
};

export default QuoteItemActions;