import React, { useEffect, useState } from 'react';
import { ProjectCode } from '../../../types/master';
import MasterLayout from '../../common/MasterLayout';
import ProjectCodeTable from './ProjectCodeTable';
import ProjectCodeForm from './ProjectCodeForm';
import Modal from '../../common/Modal';
import { useProjectCodes } from '../../../hooks/useProjectCodes';

const ProjectCodeMaster: React.FC = () => {
  const { projectCodes, loading, fetchProjectCodes, deleteProjectCode } = useProjectCodes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectCode, setSelectedProjectCode] = useState<ProjectCode | undefined>();

  useEffect(() => {
    fetchProjectCodes();
  }, [fetchProjectCodes]);

  const handleAdd = () => {
    setSelectedProjectCode(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (projectCode: ProjectCode) => {
    setSelectedProjectCode(projectCode);
    setIsModalOpen(true);
  };

  const handleDelete = async (projectCode: ProjectCode) => {
    if (!window.confirm('このプロジェクトコードを削除してもよろしいですか？')) return;
    await deleteProjectCode(projectCode.id);
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchProjectCodes();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <MasterLayout title="プロジェクトコード">
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
        title="プロジェクトコード"
        onAdd={handleAdd}
      >
        <ProjectCodeTable
          projectCodes={projectCodes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedProjectCode ? 'プロジェクトコード編集' : 'プロジェクトコード登録'}
      >
        <ProjectCodeForm
          projectCode={selectedProjectCode}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  );
};

export default ProjectCodeMaster;