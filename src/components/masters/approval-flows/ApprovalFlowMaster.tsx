import React, { useEffect, useState } from 'react';
import { ApprovalFlowTemplate } from '../../../types/approval';
import MasterLayout from '../../common/MasterLayout';
import ApprovalFlowTable from './ApprovalFlowTable';
import ApprovalFlowForm from './ApprovalFlowForm';
import Modal from '../../common/Modal';
import { useApprovalFlows } from '../../../hooks/useApprovalFlows';

const ApprovalFlowMaster: React.FC = () => {
  const { templates, loading, fetchTemplates } = useApprovalFlows();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ApprovalFlowTemplate | undefined>();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleAdd = () => {
    setSelectedTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (template: ApprovalFlowTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (template: ApprovalFlowTemplate) => {
    if (!window.confirm('この承認フローを削除してもよろしいですか？')) return;
    // Delete logic here
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchTemplates();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <MasterLayout title="承認フロー管理">
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
        title="承認フロー管理"
        onAdd={handleAdd}
      >
        <ApprovalFlowTable
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedTemplate ? '承認フロー編集' : '承認フロー作成'}
        size="xl"
      >
        <ApprovalFlowForm
          template={selectedTemplate}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  );
};

export default ApprovalFlowMaster;