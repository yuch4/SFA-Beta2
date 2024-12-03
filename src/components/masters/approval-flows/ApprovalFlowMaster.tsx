import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ApprovalFlowList from './ApprovalFlowList';
import ApprovalFlowForm from './ApprovalFlowForm';

const ApprovalFlowMaster: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route index element={<ApprovalFlowList />} />
        <Route path="new" element={<ApprovalFlowForm />} />
        <Route path=":id/edit" element={<ApprovalFlowForm />} />
      </Routes>
    </div>
  );
};

export default ApprovalFlowMaster;