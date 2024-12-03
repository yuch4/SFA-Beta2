import React from 'react';
import { format } from 'date-fns';
import type { ApprovalHistory as ApprovalHistoryType } from '../../hooks/useApprovalTasks';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ApprovalHistoryProps {
  history: ApprovalHistoryType[];
}

const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ history }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '承認';
      case 'REJECTED':
        return '却下';
      default:
        return '保留中';
    }
  };

  const getStatusDate = (history: ApprovalHistoryType) => {
    if (history.approved_at) {
      return format(new Date(history.approved_at), 'yyyy/MM/dd HH:mm');
    }
    if (history.rejected_at) {
      return format(new Date(history.rejected_at), 'yyyy/MM/dd HH:mm');
    }
    return '-';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">承認履歴</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((step, stepIdx) => (
            <li key={step.id}>
              <div className="relative pb-8">
                {stepIdx !== history.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full flex items-center justify-center">
                      {getStatusIcon(step.status)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">
                        {step.approver.display_name}
                      </span>
                      {' が '}
                      <span className="font-medium text-gray-900">
                        {getStatusText(step.status)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <span>{getStatusDate(step)}</span>
                      {step.comments && (
                        <p className="mt-1 text-gray-600">{step.comments}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ApprovalHistory; 