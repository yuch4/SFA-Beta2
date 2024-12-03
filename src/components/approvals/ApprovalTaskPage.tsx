import React from 'react';
import MasterLayout from '../common/MasterLayout';
import ApprovalTaskList from './ApprovalTaskList';

const ApprovalTaskPage: React.FC = () => {
  return (
    <MasterLayout title="承認タスク">
      <ApprovalTaskList />
    </MasterLayout>
  );
};

export default ApprovalTaskPage; 