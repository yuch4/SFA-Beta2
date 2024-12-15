import React from 'react';
import { Status } from '../../../types/master';
import { DataTable } from '../../common/DataTable';

interface StatusTableProps {
  statuses: Status[];
  onEdit: (status: Status) => void;
  onDelete: (status: Status) => void;
}

const StatusTable: React.FC<StatusTableProps> = ({ statuses, onEdit, onDelete }) => {
  const columns = [
    { key: 'status_code', header: 'ステータスコード' },
    { key: 'status_name', header: 'ステータス名' },
    { key: 'display_order', header: '表示順' },
    {
      key: 'color_settings',
      header: '表示色',
      render: (value: string) => (
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{ backgroundColor: value }}
          />
          {value}
        </div>
      ),
    },
    {
      key: 'is_active',
      header: '状態',
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? '有効' : '無効'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={statuses}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default StatusTable;