import React from 'react';
import { MoveUp, MoveDown, Copy, Trash2 } from 'lucide-react';
import { QuoteItem } from '../../types/quote';
import { Supplier } from '../../types/master';
import { MasterSearchField } from '../common/MasterSearchField';

interface QuoteItemTableProps {
  items: QuoteItem[];
  suppliers: Supplier[];
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, updates: Partial<QuoteItem>) => void;
}

const QuoteItemTable: React.FC<QuoteItemTableProps> = ({
  items,
  suppliers,
  onMove,
  onDuplicate,
  onDelete,
  onUpdate,
}) => {
  const calculateTotals = () => {
    return items.reduce((totals, item) => {
      const amount = (item.quantity || 0) * (item.unit_price || 0);
      const purchaseAmount = (item.quantity || 0) * (item.purchase_unit_price || 0);
      return {
        subtotal: totals.subtotal + amount,
        purchaseTotal: totals.purchaseTotal + purchaseAmount,
      };
    }, { subtotal: 0, purchaseTotal: 0 });
  };

  const { subtotal, purchaseTotal } = calculateTotals();
  const profitAmount = subtotal - purchaseTotal;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                操作
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                品名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                数量
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                単位
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                単価
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                金額
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                仕入先
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                仕入単価
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                課税
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => onMove(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="上へ移動"
                    >
                      <MoveUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(index, 'down')}
                      disabled={index === items.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="下へ移動"
                    >
                      <MoveDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicate(index)}
                      className="text-gray-400 hover:text-gray-600"
                      title="複製"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(index)}
                      className="text-red-400 hover:text-red-600"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.item_name}
                    onChange={(e) => onUpdate(index, { item_name: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="品名を入力"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdate(index, { quantity: parseFloat(e.target.value) || 0 })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    min="0"
                    step="1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => onUpdate(index, { unit: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="個"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => onUpdate(index, { unit_price: parseFloat(e.target.value) || 0 })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    min="0"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={item.amount.toLocaleString()}
                    readOnly
                    className="block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm sm:text-sm font-medium"
                  />
                </td>
                <td className="px-4 py-2">
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
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.purchase_unit_price}
                    onChange={(e) => onUpdate(index, { purchase_unit_price: parseFloat(e.target.value) || 0 })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    min="0"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.is_tax_applicable}
                    onChange={(e) => onUpdate(index, { is_tax_applicable: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td colSpan={5} className="px-4 py-3 text-right border-t">
                小計
              </td>
              <td className="px-4 py-3 text-right border-t">
                ¥{subtotal.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right border-t" colSpan={3}>
                仕入額: ¥{purchaseTotal.toLocaleString()} / 
                粗利額: ¥{profitAmount.toLocaleString()} / 
                粗利率: {subtotal ? ((profitAmount / subtotal) * 100).toFixed(1) : 0}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteItemTable;