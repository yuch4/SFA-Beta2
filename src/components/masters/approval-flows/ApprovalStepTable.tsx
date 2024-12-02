import React from 'react';
import { MoveUp, MoveDown, Copy, Trash2 } from 'lucide-react';
import { ApprovalFlowStep, ApproverType } from '../../../types/approval';
import { ApproverSearchField } from '../../common/ApproverSearchField';

interface ApprovalStepTableProps {
  steps: ApprovalFlowStep[];
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, updates: Partial<ApprovalFlowStep>) => void;
}

const ApprovalStepTable: React.FC<ApprovalStepTableProps> = ({
  steps,
  onMove,
  onDuplicate,
  onDelete,
  onUpdate,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              操作
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ステップ名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
              承認者タイプ
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              承認者
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              スキップ可
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {steps.map((step, index) => (
            <tr key={step.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="上へ移動"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="下へ移動"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(index)}
                    className="text-gray-400 hover:text-gray-600"
                    title="複製"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    className="text-red-400 hover:text-red-600"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={step.step_name}
                  onChange={(e) => onUpdate(index, { step_name: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="ステップ名を入力"
                />
              </td>
              <td className="px-4 py-2">
                <select
                  value={step.approver_type}
                  onChange={(e) => onUpdate(index, { approver_type: e.target.value as ApproverType })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="USER">ユーザー</option>
                  <option value="ROLE">ロール</option>
                  <option value="DEPARTMENT">部署</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <ApproverSearchField
                  label=""
                  approverType={step.approver_type}
                  selectedId={step.approver_id}
                  onSelect={(id) => onUpdate(index, { approver_id: id })}
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={step.is_skippable}
                  onChange={(e) => onUpdate(index, { is_skippable: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovalStepTable;