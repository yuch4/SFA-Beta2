import React from 'react';
import { MoveUp, MoveDown, Copy, Trash2 } from 'lucide-react';
import { PurchaseOrderItem } from '../../types/purchase-order';

interface PurchaseOrderItemTableProps {
  items: PurchaseOrderItem[];
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, updates: Partial<PurchaseOrderItem>) => void;
}

const PurchaseOrderItemTable: React.FC<PurchaseOrderItemTableProps> = ({
  items,
  onMove,
  onDuplicate,
  onDelete,
  onUpdate,
}) => {
  const calculateTotals = () => {
    return items.reduce((total, item) => total + (item.amount || 0), 0);
  };

  const subtotal = calculateTotals();

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                操作
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                商品コード
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                品名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                規格・仕様
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
                備考
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
                    value={item.item_code || ''}
                    onChange={(e) => onUpdate(index, { item_code: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="商品コード"
                  />
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
                    type="text"
                    value={item.specifications || ''}
                    onChange={(e) => onUpdate(index, { specifications: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="規格・仕様を入力"
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
                  <input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) => onUpdate(index, { notes: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="備考を入力"
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td colSpan={7} className="px-4 py-3 text-right border-t">
                小計
              </td>
              <td className="px-4 py-3 text-right border-t" colSpan={2}>
                ¥{subtotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderItemTable;