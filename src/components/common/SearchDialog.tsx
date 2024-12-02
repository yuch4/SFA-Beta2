import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Modal from './Modal';

interface SearchDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  searchFields: (keyof T)[];
  selectedId?: string;
}

export function SearchDialog<T extends { id: string }>({
  isOpen,
  onClose,
  title,
  data,
  onSelect,
  renderItem,
  searchFields,
  selectedId,
}: SearchDialogProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) =>
    searchFields.some((field) => {
      const value = String(item[field]).toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    })
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedId === item.id
                    ? 'bg-indigo-50 border-indigo-500'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}