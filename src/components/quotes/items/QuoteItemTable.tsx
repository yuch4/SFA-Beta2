import React from 'react';
import { QuoteItem } from '../../../types/quote';
import { Supplier } from '../../../types/master';
import QuoteItemRow from './QuoteItemRow';

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
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Actions
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item Name
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Quantity
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Unit
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Unit Price
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Amount
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              Purchase Price
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Tax
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <QuoteItemRow
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              suppliers={suppliers}
              onMove={onMove}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuoteItemTable;