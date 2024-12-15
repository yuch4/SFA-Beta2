import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SearchDialog } from './SearchDialog';

interface MasterSearchFieldProps<T> {
  label: string;
  value?: string;
  selectedItem?: T;
  error?: string;
  required?: boolean;
  data: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  renderSelected: (item: T) => string;
  searchFields: (keyof T)[];
}

export function MasterSearchField<T extends { id: string }>({
  label,
  value,
  selectedItem,
  error,
  required,
  data,
  onSelect,
  renderItem,
  renderSelected,
  searchFields,
}: MasterSearchFieldProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${selectedItem ? 'bg-gray-50' : 'bg-white'}`}
          placeholder={`${label}を検索...`}
          value={selectedItem ? renderSelected(selectedItem) : ''}
          onClick={() => setIsDialogOpen(true)}
          readOnly
        />
        <Search
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <SearchDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`${label}を選択`}
        data={data}
        onSelect={onSelect}
        renderItem={renderItem}
        searchFields={searchFields}
        selectedId={selectedItem?.id}
      />
    </div>
  );
}