import React, { useEffect, useState } from 'react';
import { Status } from '../../../types/master';
import MasterLayout from '../../common/MasterLayout';
import StatusTable from './StatusTable';
import StatusForm from './StatusForm';
import Modal from '../../common/Modal';
import { useStatuses } from '../../../hooks/useStatuses';

const StatusMaster: React.FC = () => {
  const { statuses, loading, fetchStatuses, deleteStatus } = useStatuses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | undefined>();

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const handleAdd = () => {
    setSelectedStatus(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (status: Status) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleDelete = async (status: Status) => {
    if (!window.confirm('このステータスを削除してもよろしいですか？')) return;
    await deleteStatus(status.id);
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchStatuses();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <MasterLayout title="ステータス管理">
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
        title="ステータス管理"
        onAdd={handleAdd}
      >
        <StatusTable
          statuses={statuses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedStatus ? 'ステータス編集' : 'ステータス登録'}
      >
        <StatusForm
          status={selectedStatus}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  );
};

export default StatusMaster;