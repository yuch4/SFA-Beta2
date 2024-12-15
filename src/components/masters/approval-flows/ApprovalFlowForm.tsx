import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { ApprovalFlow, ApprovalFlowStep } from '../../../types/approval-flow';
import FormField from '../../common/FormField';

interface FormData extends Omit<ApprovalFlow, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
  approval_flow_steps: Array<Omit<ApprovalFlowStep, 'id' | 'approval_flow_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>>;
}

const initialFormData: FormData = {
  flow_name: '',
  description: '',
  status: 'ACTIVE',
  is_active: true,
  is_deleted: false,
  approval_flow_steps: [],
};

const ApprovalFlowForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; display_name: string }>>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .eq('is_active', true)
          .order('display_name');

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchApprovalFlow = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('approval_flows')
          .select(`
            *,
            approval_flow_steps (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        const steps = data.approval_flow_steps
          .filter((step: ApprovalFlowStep) => !step.is_deleted)
          .sort((a: ApprovalFlowStep, b: ApprovalFlowStep) => a.step_order - b.step_order)
          .map((step: ApprovalFlowStep) => ({
            step_order: step.step_order,
            approver_id: step.approver_id,
            is_active: step.is_active,
            is_deleted: step.is_deleted,
          }));

        setFormData({
          flow_name: data.flow_name,
          description: data.description || '',
          status: data.status,
          is_active: data.is_active,
          is_deleted: data.is_deleted,
          approval_flow_steps: steps,
        });
      } catch (err) {
        console.error('Error fetching approval flow:', err);
        setError(err instanceof Error ? err : new Error('承認フローの取得に失敗しました'));
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalFlow();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newSteps = [...prev.approval_flow_steps];
      newSteps[index] = {
        ...newSteps[index],
        [field]: value,
      };
      return {
        ...prev,
        approval_flow_steps: newSteps,
      };
    });
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      approval_flow_steps: [
        ...prev.approval_flow_steps,
        {
          step_order: prev.approval_flow_steps.length + 1,
          approver_id: '',
          is_active: true,
          is_deleted: false,
        },
      ],
    }));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.approval_flow_steps.length - 1)
    ) {
      return;
    }

    setFormData(prev => {
      const newSteps = [...prev.approval_flow_steps];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];

      return {
        ...prev,
        approval_flow_steps: newSteps.map((step, i) => ({
          ...step,
          step_order: i + 1,
        })),
      };
    });
  };

  const duplicateStep = (index: number) => {
    setFormData(prev => {
      const newSteps = [...prev.approval_flow_steps];
      const stepToDuplicate = { ...newSteps[index] };
      newSteps.splice(index + 1, 0, {
        ...stepToDuplicate,
        step_order: stepToDuplicate.step_order + 1,
      });

      return {
        ...prev,
        approval_flow_steps: newSteps.map((step, i) => ({
          ...step,
          step_order: i + 1,
        })),
      };
    });
  };

  const deleteStep = (index: number) => {
    setFormData(prev => {
      const newSteps = prev.approval_flow_steps.filter((_, i) => i !== index);
      return {
        ...prev,
        approval_flow_steps: newSteps.map((step, i) => ({
          ...step,
          step_order: i + 1,
        })),
      };
    });
  };

  const checkDuplicateStepOrder = async (approvalFlowId: string, stepOrder: number) => {
    const { data, error } = await supabase
      .from('approval_flow_steps')
      .select()
      .eq('approval_flow_id', approvalFlowId)
      .eq('step_order', stepOrder);

    return data && data.length > 0;
  };

  const getNextAvailableStepOrder = async (approvalFlowId: string) => {
    const { data, error } = await supabase
      .from('approval_flow_steps')
      .select('step_order')
      .eq('approval_flow_id', approvalFlowId)
      .order('step_order', { ascending: false })
      .limit(1);

    return (data && data[0]?.step_order || 0) + 1;
  };

  const reorderSteps = async (approvalFlowId: string, steps: any[]) => {
    const { error } = await supabase
      .from('approval_flow_steps')
      .upsert(
        steps.map((step, index) => ({
          ...step,
          step_order: index + 1,
        }))
      );

    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const now = new Date().toISOString();

      if (id) {
        // Update existing approval flow
        const { error: flowError } = await supabase
          .from('approval_flows')
          .update({
            flow_name: formData.flow_name,
            description: formData.description,
            status: formData.status,
            updated_at: now,
            updated_by: user.id,
          })
          .eq('id', id);

        if (flowError) throw flowError;

        // 既存のステップを削除
        const { error: deleteError } = await supabase
          .from('approval_flow_steps')
          .delete()
          .eq('approval_flow_id', id);

        if (deleteError) throw deleteError;

        // 削除の確認
        const { data: existingSteps, error: checkError } = await supabase
          .from('approval_flow_steps')
          .select('id')
          .eq('approval_flow_id', id);

        if (checkError) throw checkError;

        if (existingSteps && existingSteps.length > 0) {
          throw new Error('既存のステップの削除に失敗しました');
        }

        // 少し待機して確実に削除が完了するのを待つ
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 新しいステップを挿入
        const newSteps = formData.approval_flow_steps.map((step, index) => ({
          approval_flow_id: id,
          step_order: index + 1,
          approver_id: step.approver_id,
          is_active: true,
          is_deleted: false,
          created_by: user.id,
          updated_by: user.id,
        }));

        // 削除後に新しいステップを挿入
        const { error: insertError } = await supabase
          .from('approval_flow_steps')
          .insert(newSteps);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

      } else {
        // Create new approval flow
        const { data: flow, error: flowError } = await supabase
          .from('approval_flows')
          .insert([{
            flow_name: formData.flow_name,
            description: formData.description,
            status: formData.status,
            is_active: true,
            is_deleted: false,
            created_by: user.id,
            updated_by: user.id,
          }])
          .select()
          .single();

        if (flowError) throw flowError;

        // Insert steps with ordered step_order
        const newSteps = formData.approval_flow_steps.map((step, index) => ({
          approval_flow_id: flow.id,
          step_order: index + 1,
          approver_id: step.approver_id,
          is_active: true,
          is_deleted: false,
          created_by: user.id,
          updated_by: user.id,
        }));

        const { error: stepsError } = await supabase
          .from('approval_flow_steps')
          .insert(newSteps);

        if (stepsError) throw stepsError;
      }

      navigate('/masters/approval-flows');
    } catch (err) {
      console.error('Error saving approval flow:', err);
      setError(err instanceof Error ? err : new Error('���認フローの保存に失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            label="フロー名"
            name="flow_name"
            type="text"
            value={formData.flow_name}
            onChange={handleChange}
            required
          />

          <FormField
            label="説明"
            name="description"
            as="textarea"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            labelClassName="ml-0"
            className="w-full"
          />

          <FormField
            label="ステータス"
            name="status"
            as="select"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'ACTIVE', label: '有効' },
              { value: 'INACTIVE', label: '無効' },
            ]}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">承認ステップ</h3>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            ステップ追加
          </button>
        </div>

        <div className="space-y-4">
          {formData.approval_flow_steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500 w-24">
                ステップ {step.step_order}
              </span>
              <select
                value={step.approver_id}
                onChange={(e) => handleStepChange(index, 'approver_id', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">承認者を選択</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === formData.approval_flow_steps.length - 1}
                  className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => duplicateStep(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteStep(index)}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/masters/approval-flows')}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default ApprovalFlowForm;