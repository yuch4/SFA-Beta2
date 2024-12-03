import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { toast } from 'react-hot-toast';

export const useApprovalRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createApprovalRequest = async (
    flowId: string,
    requestType: string,
    requestId: string,
    notes?: string
  ) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      setLoading(true);
      setError(null);

      // 承認フローのステップ情報を取得
      const { data: stepsData, error: stepsError } = await supabase
        .from('approval_flow_steps')
        .select('*')
        .eq('approval_flow_id', flowId)
        .eq('is_deleted', false)
        .order('step_order');

      if (stepsError) throw stepsError;

      // 承認申請を作成
      const { data: requestData, error: requestError } = await supabase
        .from('approval_requests')
        .insert([
          {
            approval_flow_id: flowId,
            request_type: requestType,
            request_id: requestId,
            status: 'PENDING',
            requested_by: user.id,
            notes,
            created_by: user.id,
            updated_by: user.id,
          },
        ])
        .select()
        .single();

      if (requestError) throw requestError;

      // 承認ステップを作成
      const stepRecords = stepsData.map((step) => ({
        approval_request_id: requestData.id,
        step_order: step.step_order,
        approver_id: step.approver_id,
        status: step.step_order === 1 ? 'PENDING' : 'PENDING',
        created_by: user.id,
        updated_by: user.id,
      }));

      const { error: stepsInsertError } = await supabase
        .from('approval_request_steps')
        .insert(stepRecords);

      if (stepsInsertError) throw stepsInsertError;

      toast.success('承認申請を作成しました');
      return requestData;
    } catch (err) {
      console.error('Error creating approval request:', err);
      setError(err instanceof Error ? err : new Error('承認申請の作成に失敗しました'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createApprovalRequest,
  };
}; 