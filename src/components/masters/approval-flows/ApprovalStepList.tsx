import React from 'react';
import { Plus } from 'lucide-react';
import { ApprovalFlowStep, ApproverType } from '../../../types/approval';
import ApprovalStepTable from './ApprovalStepTable';

interface ApprovalStepListProps {
  steps: ApprovalFlowStep[];
  onStepsChange: (steps: ApprovalFlowStep[]) => void;
  error?: string;
}

const ApprovalStepList: React.FC<ApprovalStepListProps> = ({
  steps,
  onStepsChange,
  error,
}) => {
  const addStep = () => {
    const newStep: ApprovalFlowStep = {
      id: crypto.randomUUID(),
      template_id: '',
      step_order: steps.length + 1,
      step_name: '',
      description: '',
      approver_type: 'USER' as ApproverType,
      approver_id: '',
      is_skippable: false,
      created_at: new Date().toISOString(),
      created_by: '',
      updated_at: new Date().toISOString(),
      updated_by: '',
      is_active: true,
      is_deleted: false,
    };
    onStepsChange([...steps, newStep]);
  };

  const updateStep = (index: number, updates: Partial<ApprovalFlowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onStepsChange(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];

    newSteps[index].step_order = index + 1;
    newSteps[newIndex].step_order = newIndex + 1;

    onStepsChange(newSteps);
  };

  const duplicateStep = (index: number) => {
    const stepToDuplicate = steps[index];
    const newStep: ApprovalFlowStep = {
      ...stepToDuplicate,
      id: crypto.randomUUID(),
      step_order: steps.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onStepsChange([...steps, newStep]);
  };

  const deleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      step_order: i + 1,
    }));
    onStepsChange(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">承認ステップ</h3>
        <button
          type="button"
          onClick={addStep}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          ステップ追加
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <ApprovalStepTable
        steps={steps}
        onMove={moveStep}
        onDuplicate={duplicateStep}
        onDelete={deleteStep}
        onUpdate={updateStep}
      />
    </div>
  );
};

export default ApprovalStepList;