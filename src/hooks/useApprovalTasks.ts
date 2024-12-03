import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export interface ApprovalTask {
  id: string;
  request_type: string;
  request_id: string;
  status: string;
  requested_at: string;
  requested_by: string;
  requester: {
    display_name: string;
    email: string;
  };
  step_order: number;
  target_info: {
    quote_number?: string;
    po_number?: string;
    total_amount: number;
  };
}

export interface ApprovalHistory {
  id: string;
  step_order: number;
  status: string;
  approved_at?: string;
  rejected_at?: string;
  comments?: string;
  approver: {
    display_name: string;
    email: string;
  };
}

export const useApprovalTasks = () => {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // 承認待ちのタスクを取得
      const { data: stepsData, error: stepsError } = await supabase
        .from('approval_request_steps')
        .select(`
          id,
          step_order,
          status,
          approval_requests!inner (
            id,
            request_type,
            request_id,
            requested_at,
            requested_by,
            user_profiles (
              display_name,
              email
            )
          )
        `)
        .eq('approver_id', user.id)
        .eq('status', 'PENDING')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (stepsError) throw stepsError;

      if (!stepsData) return;

      // 各リクエストの対象（見積/発注）の情報を取得
      const tasksWithInfo = await Promise.all(
        stepsData.map(async (step) => {
          const request = step.approval_requests;
          let targetInfo = {};

          if (request.request_type === 'QUOTE') {
            const { data: quoteData } = await supabase
              .from('quotes')
              .select('quote_number, total_amount')
              .eq('id', request.request_id)
              .single();
            targetInfo = quoteData || {};
          } else if (request.request_type === 'PURCHASE_ORDER') {
            const { data: poData } = await supabase
              .from('purchase_orders')
              .select('po_number, total_amount')
              .eq('id', request.request_id)
              .single();
            targetInfo = poData || {};
          }

          return {
            id: step.id,
            request_type: request.request_type,
            request_id: request.request_id,
            status: step.status,
            requested_at: request.requested_at,
            requested_by: request.requested_by,
            requester: request.user_profiles,
            step_order: step.step_order,
            target_info: targetInfo,
          };
        })
      );

      setTasks(tasksWithInfo);
    } catch (err) {
      console.error('Error fetching approval tasks:', err);
      setError(err instanceof Error ? err : new Error('承認タスクの取得に失敗しました'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchApprovalHistory = async (requestId: string): Promise<ApprovalHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('approval_request_steps')
        .select(`
          id,
          step_order,
          status,
          approved_at,
          rejected_at,
          comments,
          user_profiles!approver_id (
            display_name,
            email
          )
        `)
        .eq('approval_request_id', requestId)
        .order('step_order', { ascending: true });

      if (error) throw error;

      return (data || []).map(step => ({
        id: step.id,
        step_order: step.step_order,
        status: step.status,
        approved_at: step.approved_at,
        rejected_at: step.rejected_at,
        comments: step.comments,
        approver: step.user_profiles[0],
      }));
    } catch (err) {
      console.error('Error fetching approval history:', err);
      throw err;
    }
  };

  const approveTask = async (taskId: string, comments?: string) => {
    if (!user) return;

    try {
      // ステップを承認済みに更新
      const { error: updateError } = await supabase
        .from('approval_request_steps')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          comments,
          updated_by: user.id,
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // タスク一覧を再取得
      await fetchTasks();
    } catch (err) {
      console.error('Error approving task:', err);
      throw err;
    }
  };

  const rejectTask = async (taskId: string, comments?: string) => {
    if (!user) return;

    try {
      // ステップを却下に更新
      const { error: updateError } = await supabase
        .from('approval_request_steps')
        .update({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          comments,
          updated_by: user.id,
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // タスク一覧を再取得
      await fetchTasks();
    } catch (err) {
      console.error('Error rejecting task:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchApprovalHistory,
    approveTask,
    rejectTask,
  };
}; 