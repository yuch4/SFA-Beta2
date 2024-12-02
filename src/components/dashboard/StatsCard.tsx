import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;