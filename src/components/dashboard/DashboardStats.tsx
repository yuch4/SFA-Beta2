import React from 'react';
import { Opportunity } from '../../types';
import StatsCard from './StatsCard';

interface DashboardStatsProps {
  opportunities: Opportunity[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ opportunities }) => {
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  const winRate = Math.round(
    (opportunities.filter((opp) => opp.stage === 'Closed Won').length /
      opportunities.length) *
      100
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard title="Total Opportunities" value={opportunities.length} />
      <StatsCard title="Total Value" value={`$${totalValue.toLocaleString()}`} />
      <StatsCard title="Win Rate" value={`${winRate}%`} />
    </div>
  );
};

export default DashboardStats;