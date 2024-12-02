import React from 'react';
import { ProjectCode } from '../../../types/master';
import { DataTable } from '../../common/DataTable';

interface ProjectCodeTableProps {
  projectCodes: ProjectCode[];
  onEdit: (projectCode: ProjectCode) => void;
  onDelete: (projectCode: ProjectCode) => void;
}

const ProjectCodeTable: React.FC<ProjectCodeTableProps> = ({ projectCodes, onEdit, onDelete }) => {
  const columns = [
    { key: 'project_code', header: 'Code' },
    { key: 'project_name', header: 'Name' },
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
      data={projectCodes}
      columns={columns}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default ProjectCodeTable;