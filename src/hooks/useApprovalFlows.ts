import { useState, useCallback } from 'react';
import { ApprovalFlow, ApprovalFlowListView, ApprovalFlowStep } from '../types/approval-flow';
import { supabase } from '../lib/supabase';

export const useApprovalFlows = () => {
  const [approvalFlows, setApprovalFlows] = useState<ApprovalFlowListView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApprovalFlows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // まず承認フローを取得
      const { data: flowsData, error: flowsError } = await supabase
        .from('approval_flows')
        .select(`
          id,
          flow_name,
          description,
          status,
          updated_at,
          updated_by
        `)
        .eq('is_deleted', false)
        .order('flow_name', { ascending: true });

      if (flowsError) throw flowsError;

      // 承認フローのステップ数を取得
      const { data: stepsData, error: stepsError } = await supabase
        .from('approval_flow_steps')
        .select('approval_flow_id')
        .eq('is_deleted', false);

      if (stepsError) throw stepsError;

      // 更新者の情報を取得
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', flowsData.map(flow => flow.updated_by));

      if (usersError) throw usersError;

      // データを整形
      const formattedFlows = flowsData.map(flow => {
        const stepCount = stepsData.filter(step => step.approval_flow_id === flow.id).length;
        const updater = usersData.find(user => user.id === flow.updated_by);
        
        return {
          id: flow.id,
          flow_name: flow.flow_name,
          description: flow.description,
          status: flow.status,
          step_count: stepCount,
          updated_at: flow.updated_at,
          updated_by_name: updater?.display_name || '',
        };
      });

      setApprovalFlows(formattedFlows);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('承認フローの取得に失敗しました'));
      console.error('Error fetching approval flows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApprovalFlowById = async (id: string) => {
    try {
      // 承認フローの基本情報を取得
      const { data: flowData, error: flowError } = await supabase
        .from('approval_flows')
        .select('*')
        .eq('id', id)
        .single();

      if (flowError) throw flowError;

      // 承認フローのステップ情報を取得
      const { data: stepsData, error: stepsError } = await supabase
        .from('approval_flow_steps')
        .select(`
          *,
          approver:approver_id (
            id,
            display_name
          )
        `)
        .eq('approval_flow_id', id)
        .eq('is_deleted', false)
        .order('step_order');

      if (stepsError) throw stepsError;

      const formattedSteps = stepsData.map(step => ({
        ...step,
        approver_name: step.approver?.display_name || '',
      }));

      return {
        ...flowData,
        approval_flow_steps: formattedSteps,
      };
    } catch (err) {
      console.error('Error fetching approval flow:', err);
      throw err;
    }
  };

  const deleteApprovalFlow = async (flowId: string) => {
    try {
      const { error: flowError } = await supabase
        .from('approval_flows')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', flowId);

      if (flowError) throw flowError;

      const { error: stepsError } = await supabase
        .from('approval_flow_steps')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('approval_flow_id', flowId);

      if (stepsError) throw stepsError;

      await fetchApprovalFlows();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('承認フローの削除に失敗しました'));
      console.error('Error deleting approval flow:', err);
      throw err;
    }
  };

  return {
    approvalFlows,
    loading,
    error,
    fetchApprovalFlows,
    fetchApprovalFlowById,
    deleteApprovalFlow,
  };
};