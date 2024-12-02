import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Opportunity } from '../../types';

interface OpportunityChartProps {
  opportunities: Opportunity[];
}

const OpportunityChart: React.FC<OpportunityChartProps> = ({ opportunities }) => {
  const opportunityData = opportunities.reduce((acc: any[], opp) => {
    const month = new Date(opp.created_at).toLocaleString('default', { month: 'short' });
    const existingMonth = acc.find((item) => item.month === month);
    
    if (existingMonth) {
      existingMonth.amount += opp.amount;
    } else {
      acc.push({ month, amount: opp.amount });
    }
    return acc;
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Opportunity Trend</h2>
      <BarChart width={800} height={300} data={opportunityData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="amount" fill="#3B82F6" />
      </BarChart>
    </div>
  );
};

export default OpportunityChart;