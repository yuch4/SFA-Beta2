import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useApprovalFlows } from '../../hooks/useApprovalFlows';
import { ApprovalFlowListView } from '../../types/approval-flow';

interface ApprovalFlowSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (flowId: string) => void;
}

const ApprovalFlowSelectDialog: React.FC<ApprovalFlowSelectDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { approvalFlows, loading, error, fetchApprovalFlows } = useApprovalFlows();
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchApprovalFlows();
    }
  }, [isOpen, fetchApprovalFlows]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFlowId) {
      onSelect(selectedFlowId);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900"
          >
            承認フローの選択
          </Dialog.Title>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mt-4 space-y-4">
                {approvalFlows
                  .filter(flow => flow.status === 'ACTIVE')
                  .map((flow: ApprovalFlowListView) => (
                    <label
                      key={flow.id}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="approvalFlow"
                        value={flow.id}
                        checked={selectedFlowId === flow.id}
                        onChange={(e) => setSelectedFlowId(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {flow.flow_name}
                        </div>
                        {flow.description && (
                          <div className="text-sm text-gray-500">
                            {flow.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          承認ステップ数: {flow.step_count}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!selectedFlowId}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  選択
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ApprovalFlowSelectDialog; 