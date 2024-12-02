import React from 'react';
import { format } from 'date-fns';
import { Supplier } from '../../../types/master';
import { DataTable } from '../../common/DataTable';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDelete }) => {
  const columns = [
    { key: 'supplier_code', header: 'Code' },
    { key: 'supplier_name', header: 'Name' },
    { key: 'supplier_type', header: 'Type' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    {
      key: 'created_at',
      header: 'Created At',
      render: (value: string) => format(new Date(value), 'yyyy-MM-dd'),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={suppliers}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default SupplierTable;