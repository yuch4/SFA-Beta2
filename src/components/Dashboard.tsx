import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import DashboardStats from './dashboard/DashboardStats';
import OpportunityChart from './dashboard/OpportunityChart';

const Dashboard = () => {
  const { opportunities, fetchOpportunities, loading } = useStore();

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardStats opportunities={opportunities} />
      <OpportunityChart opportunities={opportunities} />
    </div>
  );
};

export default Dashboard;