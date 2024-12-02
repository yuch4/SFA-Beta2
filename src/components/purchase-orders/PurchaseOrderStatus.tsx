import React from 'react';
import { PurchaseOrderStatus } from '../../types/purchase-order';

interface StatusOption {
  value: PurchaseOrderStatus;
  label: string;
  bgColor: string;
  textColor: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'DRAFT', label: '下書き', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  { value: 'ORDERED', label: '発注済み', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { value: 'DELIVERED', label: '納品済み', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  { value: 'COMPLETED', label: '計上済み', bgColor: 'bg-green-100', textColor: 'text-green-800' },
];

export const getStatusOption = (status: PurchaseOrderStatus): StatusOption => {
  return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
};

interface PurchaseOrderStatusSelectProps {
  status: PurchaseOrderStatus;
  onChange: (status: PurchaseOrderStatus) => void;
  disabled?: boolean;
}

export const PurchaseOrderStatusSelect: React.FC<PurchaseOrderStatusSelectProps> = ({ 
  status, 
  onChange,
  disabled = false
}) => {
  const currentOption = getStatusOption(status);

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as PurchaseOrderStatus)}
      disabled={disabled}
      className={`${currentOption.bgColor} ${currentOption.textColor} font-semibold text-sm rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {STATUS_OPTIONS.map(option => (
        <option 
          key={option.value} 
          value={option.value}
          className="bg-white text-gray-900 font-normal"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};