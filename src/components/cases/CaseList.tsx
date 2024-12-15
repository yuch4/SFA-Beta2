import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CaseListView } from '../../types/case';
import { DataTable } from '../common/DataTable';
import MasterLayout from '../common/MasterLayout';
import Modal from '../common/Modal';
import CaseForm from './CaseForm';
import { useCases } from '../../hooks/useCases';

const CaseList: React.FC = () => {
  const { cases, loading, fetchCases, deleteCase } = useCases();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseListView | undefined>();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleAdd = () => {
    setSelectedCase(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (caseItem: CaseListView) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };

  const handleDelete = async (caseItem: CaseListView) => {
    if (!window.confirm('この案件を削除してもよろしいですか？')) return;
    await deleteCase(caseItem.id);
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchCases();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'case_number', header: '案件番号' },
    { key: 'case_name', header: '案件名' },
    { key: 'customer_name', header: '顧客名' },
    {
      key: 'expected_revenue',
      header: '予想売上',
      render: (value: number) => value.toLocaleString('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      })
    },
    {
      key: 'expected_profit',
      header: '予想利益',
      render: (value: number) => value.toLocaleString('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      })
    },
    { key: 'status_name', header: 'ステータス' },
    {
      key: 'probability',
      header: '確度',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'S' ? 'bg-purple-100 text-purple-800' :
          value === 'A' ? 'bg-blue-100 text-blue-800' :
          value === 'B' ? 'bg-green-100 text-green-800' :
          value === 'C' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'expected_order_date',
      header: '受注予定日',
      render: (value: string) => format(new Date(value), 'yyyy年MM月')
    },
    {
      key: 'expected_accounting_date',
      header: '計上予定日',
      render: (value: string) => format(new Date(value), 'yyyy年MM月')
    },
    { key: 'assigned_to_name', header: '担当者' },
  ];

  if (loading) {
    return (
      <MasterLayout title="案件管理">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <>
      <MasterLayout
        title="案件管理"
        onAdd={handleAdd}
      >
        <DataTable
          data={cases}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedCase ? '案件編集' : '案件登録'}
      >
        <CaseForm
          caseData={selectedCase}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  );
};

export default CaseList;