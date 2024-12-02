import React from 'react';
import { ApprovalFlowTemplate } from '../../../types/approval';
import { DataTable } from '../../common/DataTable';

interface ApprovalFlowTableProps {
  templates: ApprovalFlowTemplate[];
  onEdit: (template: ApprovalFlowTemplate) => void;
  onDelete: (template: ApprovalFlowTemplate) => void;
}

const ApprovalFlowTable: React.FC<ApprovalFlowTableProps> = ({
  templates,
  onEdit,
  onDelete,
}) => {
  const columns = [
    { key: 'template_code', header: 'コード' },
    { key: 'template_name', header: '承認フロー名' },
    {
      key: 'target_type',
      header: '対象種別',
      render: (value: string) => (
        value === 'QUOTE' ? '見積書' : '発注書'
      ),
    },
    {
      key: 'is_active',
      header: 'ステータス',
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
      data={templates}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default ApprovalFlowTable;