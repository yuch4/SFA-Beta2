import React from 'react';
import { format } from 'date-fns';
import { Customer } from '../../../types/master';
import { DataTable } from '../../common/DataTable';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onEdit, onDelete }) => {
  const columns = [
    { key: 'customer_code', header: 'Code' },
    { key: 'customer_name', header: 'Name' },
    { key: 'customer_type', header: 'Type' },
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
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={customers}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default CustomerTable;