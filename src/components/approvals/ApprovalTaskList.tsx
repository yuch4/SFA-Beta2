import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Check, X, History } from 'lucide-react';
import { useApprovalTasks, ApprovalHistory as ApprovalHistoryType } from '../../hooks/useApprovalTasks';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ApprovalHistory from './ApprovalHistory';

const ApprovalTaskList: React.FC = () => {
  const { tasks, loading, error, fetchTasks, approveTask, rejectTask, fetchApprovalHistory } = useApprovalTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [history, setHistory] = useState<ApprovalHistoryType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleApprove = async (taskId: string) => {
    try {
      await approveTask(taskId, comments);
      toast.success('承認が完了しました');
      setSelectedTaskId(null);
      setComments('');
    } catch (error) {
      console.error('Error approving task:', error);
      toast.error('承認に失敗しました');
    }
  };

  const handleReject = async (taskId: string) => {
    if (!comments) {
      toast.error('却下理由を入力してください');
      return;
    }

    try {
      await rejectTask(taskId, comments);
      toast.success('却下が完了しました');
      setSelectedTaskId(null);
      setComments('');
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast.error('却下に失敗しました');
    }
  };

  const handleShowHistory = async (requestId: string) => {
    try {
      setLoadingHistory(true);
      if (showHistory === requestId) {
        setShowHistory(null);
        setHistory([]);
        return;
      }

      const historyData = await fetchApprovalHistory(requestId);
      setHistory(historyData);
      setShowHistory(requestId);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('履歴の取得に失敗しました');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRowClick = (taskId: string, requestType: string, requestId: string) => {
    if (requestType === 'QUOTE') {
      navigate(`/quotes/${requestId}`);
    } else if (requestType === 'PURCHASE_ORDER') {
      navigate(`/purchase-orders/${requestId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">承認タスク一覧</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                種別
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請日時
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステップ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(task.id, task.request_type, task.request_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {task.request_type === 'QUOTE' ? '見積' : '発注'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.target_info.quote_number || task.target_info.po_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{task.requester.display_name}</div>
                    <div className="text-sm text-gray-500">{task.requester.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(task.requested_at), 'yyyy/MM/dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.target_info.total_amount?.toLocaleString('ja-JP', {
                      style: 'currency',
                      currency: 'JPY'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ステップ {task.step_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowHistory(task.request_id);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <History className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(selectedTaskId === task.id ? null : task.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      承認/却下
                    </button>
                  </td>
                </tr>
                {selectedTaskId === task.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="コメントを入力（却下時は必須）"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleApprove(task.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            承認
                          </button>
                          <button
                            onClick={() => handleReject(task.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            却下
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {showHistory === task.request_id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      {loadingHistory ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : (
                        <ApprovalHistory history={history} />
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            承認待ちのタスクはありません
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalTaskList; 