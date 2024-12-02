import React from 'react';
import { MoveUp, MoveDown, Copy, Trash2 } from 'lucide-react';
import { QuoteItem } from '../../../types/quote';
import { Supplier } from '../../../types/master';
import { MasterSearchField } from '../../common/MasterSearchField';

interface QuoteItemRowProps {
  item: QuoteItem;
  index: number;
  totalItems: number;
  suppliers: Supplier[];
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, updates: Partial<QuoteItem>) => void;
}

const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
  item,
  index,
  totalItems,
  suppliers,
  onMove,
  onDuplicate,
  onDelete,
  onUpdate,
}) => {
  return (
    <tr className={item.item_type !== 'NORMAL' ? 'bg-gray-50' : ''}>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <MoveUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 'down')}
            disabled={index === totalItems - 1}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <MoveDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            className="text-gray-400 hover:text-gray-500"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="text-red-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.item_name}
          onChange={(e) => onUpdate(index, { item_name: e.target.value })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={item.item_type !== 'NORMAL'}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate(index, { quantity: parseFloat(e.target.value) || 0 })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={item.item_type !== 'NORMAL'}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.unit}
          onChange={(e) => onUpdate(index, { unit: e.target.value })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={item.item_type !== 'NORMAL'}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.unit_price}
          onChange={(e) => onUpdate(index, { unit_price: parseFloat(e.target.value) || 0 })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={item.item_type === 'SUBTOTAL'}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.amount}
          readOnly
          className="block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm sm:text-sm"
        />
      </td>
      <td className="px-3 py-2">
        {item.item_type === 'NORMAL' ? (
          <MasterSearchField
            label=""
            selectedItem={suppliers.find(s => s.id === item.supplier_id)}
            data={suppliers}
            onSelect={(supplier) => onUpdate(index, { supplier_id: supplier.id })}
            renderItem={(supplier) => (
              <div>
                <div className="font-medium">{supplier.supplier_name}</div>
                <div className="text-sm text-gray-500">{supplier.supplier_code}</div>
              </div>
            )}
            renderSelected={(supplier) => `${supplier.supplier_code} - ${supplier.supplier_name}`}
            searchFields={['supplier_code', 'supplier_name']}
          />
        ) : (
          <div className="h-9" />
        )}
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.purchase_unit_price}
          onChange={(e) => onUpdate(index, { purchase_unit_price: parseFloat(e.target.value) || 0 })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={item.item_type !== 'NORMAL'}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={item.is_tax_applicable}
          onChange={(e) => onUpdate(index, { is_tax_applicable: e.target.checked })}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          disabled={item.item_type !== 'NORMAL'}
        />
      </td>
    </tr>
  );
};

export default QuoteItemRow;