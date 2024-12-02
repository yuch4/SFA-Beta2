import React, { useState } from 'react';
import { ApprovalFlowTemplate, ApprovalFlowStep, ApprovalTargetType, ApproverType } from '../../../types/approval';
import FormField from '../../common/FormField';
import ApprovalStepList from './ApprovalStepList';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { toast } from 'react-hot-toast';

interface ApprovalFlowFormProps {
  template?: ApprovalFlowTemplate;
  onSubmit: () => void;
  onCancel: () => void;
}

const ApprovalFlowForm: React.FC<ApprovalFlowFormProps> = ({
  template,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<ApprovalFlowTemplate>>(
    template || {
      template_code: '',
      template_name: '',
      description: '',
      target_type: 'QUOTE' as ApprovalTargetType,
      is_active: true,
    }
  );
  const [steps, setSteps] = useState<ApprovalFlowStep[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.template_code?.trim()) newErrors.template_code = 'コードは必須です';
    if (!formData.template_name?.trim()) newErrors.template_name = '承認フロー名は必須です';
    if (!formData.target_type) newErrors.target_type = '対象種別は必須です';
    if (steps.length === 0) newErrors.steps = '承認ステップを1つ以上設定してください';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      if (template) {
        const { error: templateError } = await supabase
          .from('approval_flow_templates')
          .update({
            ...formData,
            updated_at: now,
            updated_by: user?.id,
          })
          .eq('id', template.id);

        if (templateError) throw templateError;

        // Update steps
        const { error: deleteError } = await supabase
          .from('approval_flow_steps')
          .update({ is_deleted: true })
          .eq('template_id', template.id);

        if (deleteError) throw deleteError;

        const stepsToInsert = steps.map(step => ({
          ...step,
          template_id: template.id,
          created_by: user?.id,
          updated_by: user?.id,
        }));

        const { error: stepsError } = await supabase
          .from('approval_flow_steps')
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;

        toast.success('承認フローを更新しました');
      } else {
        const { data: templateData, error: templateError } = await supabase
          .from('approval_flow_templates')
          .insert([{
            ...formData,
            created_by: user?.id,
            updated_by: user?.id,
          }])
          .select()
          .single();

        if (templateError) throw templateError;

        const stepsToInsert = steps.map(step => ({
          ...step,
          template_id: templateData.id,
          created_by: user?.id,
          updated_by: user?.id,
        }));

        const { error: stepsError } = await supabase
          .from('approval_flow_steps')
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;

        toast.success('承認フローを作成しました');
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving approval flow:', error);
      toast.error('承認フローの保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="承認フローコード"
          name="template_code"
          value={formData.template_code}
          onChange={handleChange}
          error={errors.template_code}
          required
        />

        <FormField
          label="承認フロー名"
          name="template_name"
          value={formData.template_name}
          onChange={handleChange}
          error={errors.template_name}
          required
        />
      </div>

      <FormField
        label="対象種別"
        name="target_type"
        as="select"
        value={formData.target_type}
        onChange={handleChange}
        error={errors.target_type}
        required
      >
        <option value="QUOTE">見積書</option>
        <option value="PURCHASE_ORDER">発注書</option>
      </FormField>

      <FormField
        label="説明"
        name="description"
        as="textarea"
        value={formData.description}
        onChange={handleChange}
        rows={3}
      />

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">有効</span>
        </label>
      </div>

      <ApprovalStepList
        steps={steps}
        onStepsChange={setSteps}
        error={errors.steps}
      />

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : template ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
};

export default ApprovalFlowForm;