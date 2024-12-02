import React, { ReactNode } from 'react';
import { PlusCircle, Upload, Download } from 'lucide-react';

interface MasterLayoutProps {
  title: string;
  onAdd?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  children: ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({
  title,
  onAdd,
  onImport,
  onExport,
  children,
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="space-x-4">
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          )}
          {onImport && (
            <button
              onClick={onImport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default MasterLayout;