import React from 'react';
import { Plus } from 'lucide-react';
import { QuoteItem } from '../../types/quote';
import { Supplier } from '../../types/master';
import QuoteItemTable from './QuoteItemTable';

interface QuoteItemListProps {
  items: QuoteItem[];
  suppliers: Supplier[];
  onItemsChange: (items: QuoteItem[]) => void;
}

const QuoteItemList: React.FC<QuoteItemListProps> = ({
  items,
  suppliers,
  onItemsChange,
}) => {
  const addItem = () => {
    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      quote_id: '',
      item_order: items.length + 1,
      item_type: 'NORMAL',
      item_name: '',
      quantity: 1,
      unit: '',
      unit_price: 0,
      purchase_unit_price: 0,
      amount: 0,
      is_tax_applicable: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: '',
      updated_by: '',
      is_active: true,
      is_deleted: false,
    };
    onItemsChange([...items, newItem]);
  };

  const updateItem = (index: number, updates: Partial<QuoteItem>) => {
    const newItems = [...items];
    const item = { ...newItems[index], ...updates };

    if ('quantity' in updates || 'unit_price' in updates) {
      item.amount = (item.quantity || 0) * (item.unit_price || 0);
    }

    newItems[index] = item;
    onItemsChange(newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    newItems[index].item_order = index + 1;
    newItems[newIndex].item_order = newIndex + 1;

    onItemsChange(newItems);
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = items[index];
    const newItem: QuoteItem = {
      ...itemToDuplicate,
      id: crypto.randomUUID(),
      item_order: items.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onItemsChange([...items, newItem]);
  };

  const deleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      item_order: i + 1,
    }));
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">明細情報</h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          明細追加
        </button>
      </div>

      <QuoteItemTable
        items={items}
        suppliers={suppliers}
        onMove={moveItem}
        onDuplicate={duplicateItem}
        onDelete={deleteItem}
        onUpdate={updateItem}
      />
    </div>
  );
};

export default QuoteItemList;