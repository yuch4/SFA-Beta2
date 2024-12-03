import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './providers/AuthProvider';
import RequireAuth from './components/auth/RequireAuth';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerMaster from './components/masters/customers/CustomerMaster';
import SupplierMaster from './components/masters/suppliers/SupplierMaster';
import ProjectCodeMaster from './components/masters/project-codes/ProjectCodeMaster';
import StatusMaster from './components/masters/statuses/StatusMaster';
import ApprovalFlowMaster from './components/masters/approval-flows/ApprovalFlowMaster';
import CaseList from './components/cases/CaseList';
import QuoteList from './components/quotes/QuoteList';
import PurchaseOrderList from './components/purchase-orders/PurchaseOrderList';
import PurchaseOrderRevisionDialog from './components/purchase-orders/PurchaseOrderRevisionDialog';
import ApprovalTaskPage from './components/approvals/ApprovalTaskPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 bg-gray-100 min-h-screen">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/masters/customers" element={<CustomerMaster />} />
                      <Route path="/masters/suppliers" element={<SupplierMaster />} />
                      <Route path="/masters/project-codes" element={<ProjectCodeMaster />} />
                      <Route path="/masters/statuses" element={<StatusMaster />} />
                      <Route path="/masters/approval-flows/*" element={<ApprovalFlowMaster />} />
                      <Route path="/cases" element={<CaseList />} />
                      <Route path="/quotes" element={<QuoteList />} />
                      <Route path="/purchase-orders" element={<PurchaseOrderList />} />
                      <Route path="/purchase-orders/:id" element={<PurchaseOrderRevisionDialog />} />
                      <Route path="/approvals" element={<ApprovalTaskPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </RequireAuth>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;