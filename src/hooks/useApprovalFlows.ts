import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import {
  ApprovalFlowTemplate,
  ApprovalFlowStep,
  ApprovalFlowInstance,
  ApprovalStepRecord,
  ApprovalTargetType,
} from '../types/approval';
import { useAuth } from '../lib/auth';

export const useApprovalFlows = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ApprovalFlowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async (targetType?: ApprovalTargetType) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('approval_flow_templates')
        .select(`
          *,
          approval_flow_steps (*)
        `)
        .eq('is_deleted', false)
        .order('template_code');

      if (targetType) {
        query = query.eq('target_type', targetType);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      setTemplates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch approval templates'));
      console.error('Error fetching approval templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startApprovalFlow = async (
    templateId: string,
    targetType: ApprovalTargetType,
    targetId: string
  ) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Start a transaction
      const { data: template, error: templateError } = await supabase
        .from('approval_flow_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      const { data: steps, error: stepsError } = await supabase
        .from('approval_flow_steps')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_deleted', false)
        .order('step_order');

      if (stepsError) throw stepsError;

      // Create approval instance
      const { data: instance, error: instanceError } = await supabase
        .from('approval_flow_instances')
        .insert([{
          template_id: templateId,
          target_type: targetType,
          target_id: targetId,
          current_step: 1,
          status: 'IN_PROGRESS',
          created_by: user.id,
          updated_by: user.id,
        }])
        .select()
        .single();

      if (instanceError) throw instanceError;

      // Create step records
      const stepRecords = steps.map(step => ({
        instance_id: instance.id,
        step_id: step.id,
        step_order: step.step_order,
        status: step.step_order === 1 ? 'PENDING' : 'PENDING',
      }));

      const { error: recordsError } = await supabase
        .from('approval_step_records')
        .insert(stepRecords);

      if (recordsError) throw recordsError;

      // Update target status
      if (targetType === 'QUOTE') {
        const { error: quoteError } = await supabase
          .from('quotes')
          .update({ status: 'PENDING' })
          .eq('id', targetId);

        if (quoteError) throw quoteError;
      } else {
        const { error: poError } = await supabase
          .from('purchase_orders')
          .update({ status: 'PENDING' })
          .eq('id', targetId);

        if (poError) throw poError;
      }

      toast.success('承認フローを開始しました');
      return instance;
    } catch (err) {
      console.error('Error starting approval flow:', err);
      toast.error('承認フローの開始に失敗しました');
      throw err;
    }
  };

  const approveStep = async (
    instanceId: string,
    stepId: string,
    comments?: string
  ) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data: instance, error: instanceError } = await supabase
        .from('approval_flow_instances')
        .select('*')
        .eq('id', instanceId)
        .single();

      if (instanceError) throw instanceError;

      const { data: steps, error: stepsError } = await supabase
        .from('approval_flow_steps')
        .select('*')
        .eq('template_id', instance.template_id)
        .order('step_order');

      if (stepsError) throw stepsError;

      // Update current step record
      const { error: recordError } = await supabase
        .from('approval_step_records')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approver_id: user.id,
          comments,
        })
        .eq('instance_id', instanceId)
        .eq('step_id', stepId);

      if (recordError) throw recordError;

      // Check if this is the last step
      const currentStep = steps.find(s => s.id === stepId);
      const isLastStep = currentStep?.step_order === steps.length;

      if (isLastStep) {
        // Complete the approval flow
        const { error: completeError } = await supabase
          .from('approval_flow_instances')
          .update({
            status: 'APPROVED',
            completed_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', instanceId);

        if (completeError) throw completeError;

        // Update target status
        if (instance.target_type === 'QUOTE') {
          const { error: quoteError } = await supabase
            .from('quotes')
            .update({ status: 'APPROVED' })
            .eq('id', instance.target_id);

          if (quoteError) throw quoteError;
        } else {
          const { error: poError } = await supabase
            .from('purchase_orders')
            .update({ status: 'APPROVED' })
            .eq('id', instance.target_id);

          if (poError) throw poError;
        }
      } else {
        // Move to next step
        const nextStep = steps.find(s => s.step_order === currentStep!.step_order + 1);
        const { error: updateError } = await supabase
          .from('approval_flow_instances')
          .update({
            current_step: nextStep!.step_order,
            updated_by: user.id,
          })
          .eq('id', instanceId);

        if (updateError) throw updateError;
      }

      toast.success('承認処理が完了しました');
    } catch (err) {
      console.error('Error approving step:', err);
      toast.error('承認処理に失敗しました');
      throw err;
    }
  };

  const rejectStep = async (
    instanceId: string,
    stepId: string,
    comments: string
  ) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data: instance, error: instanceError } = await supabase
        .from('approval_flow_instances')
        .select('*')
        .eq('id', instanceId)
        .single();

      if (instanceError) throw instanceError;

      // Update step record
      const { error: recordError } = await supabase
        .from('approval_step_records')
        .update({
          status: 'REJECTED',
          approved_at: new Date().toISOString(),
          approver_id: user.id,
          comments,
        })
        .eq('instance_id', instanceId)
        .eq('step_id', stepId);

      if (recordError) throw recordError;

      // Complete the approval flow as rejected
      const { error: instanceError2 } = await supabase
        .from('approval_flow_instances')
        .update({
          status: 'REJECTED',
          completed_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', instanceId);

      if (instanceError2) throw instanceError2;

      // Update target status
      if (instance.target_type === 'QUOTE') {
        const { error: quoteError } = await supabase
          .from('quotes')
          .update({ status: 'REJECTED' })
          .eq('id', instance.target_id);

        if (quoteError) throw quoteError;
      } else {
        const { error: poError } = await supabase
          .from('purchase_orders')
          .update({ status: 'REJECTED' })
          .eq('id', instance.target_id);

        if (poError) throw poError;
      }

      toast.success('却下処理が完了しました');
    } catch (err) {
      console.error('Error rejecting step:', err);
      toast.error('却下処理に失敗しました');
      throw err;
    }
  };

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    startApprovalFlow,
    approveStep,
    rejectStep,
  };
};