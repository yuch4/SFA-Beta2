import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Supplier } from '../../types/master';
import { QuoteItem } from '../../types/quote';

interface SupplierSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedSuppliers: string[]) => void;
  suppliers: Record<string, { supplier: Supplier; items: QuoteItem[] }>;
}

const SupplierSelectionDialog: React.FC<SupplierSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suppliers,
}) => {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuppliers.length === 0) return;
    onSubmit(selectedSuppliers);
  };

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev => {
      if (prev.includes(supplierId)) {
        return prev.filter(id => id !== supplierId);
      }
      return [...prev, supplierId];
    });
  };

  const selectAll = () => {
    setSelectedSuppliers(Object.keys(suppliers));
  };

  const deselectAll = () => {
    setSelectedSuppliers([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-auto shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">発注書作成</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">仕入先選択</h4>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    すべて選択
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    選択解除
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(suppliers).map(([supplierId, { supplier, items }]) => (
                  <div
                    key={supplierId}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleSupplier(supplierId)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplierId)}
                        onChange={() => toggleSupplier(supplierId)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {supplier.supplier_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {supplier.supplier_code}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {items.length}件の明細
                            </p>
                            <p className="text-sm text-gray-500">
                              ¥{items.reduce((sum, item) => sum + (item.quantity * item.purchase_unit_price), 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <ul className="list-disc list-inside">
                            {items.slice(0, 3).map(item => (
                              <li key={item.id} className="truncate">
                                {item.item_name} ({item.quantity}{item.unit})
                              </li>
                            ))}
                            {items.length > 3 && (
                              <li>他 {items.length - 3}件...</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedSuppliers.length === 0}
              >
                発注書作成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierSelectionDialog;