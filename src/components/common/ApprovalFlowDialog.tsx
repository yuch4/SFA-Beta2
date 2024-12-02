import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ApprovalFlowTemplate, ApprovalTargetType } from '../../types/approval';
import { useApprovalFlows } from '../../hooks/useApprovalFlows';

interface ApprovalFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (templateId: string) => void;
  targetType: ApprovalTargetType;
  isSubmitting: boolean;
}

const ApprovalFlowDialog: React.FC<ApprovalFlowDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetType,
  isSubmitting,
}) => {
  const { templates, loading, fetchTemplates } = useApprovalFlows();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates(targetType);
    }
  }, [isOpen, targetType, fetchTemplates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplateId) {
      setError('承認フローを選択してください');
      return;
    }

    onSubmit(selectedTemplateId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-auto shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">承認フローの選択</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-gray-500">
                利用可能な承認フローがありません
              </p>
            ) : (
              <div className="space-y-4">
                {templates.map(template => (
                  <label
                    key={template.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      selectedTemplateId === template.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selectedTemplateId === template.id}
                      onChange={(e) => {
                        setSelectedTemplateId(e.target.value);
                        setError('');
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {template.template_name}
                      </p>
                      {template.description && (
                        <p className="text-sm text-gray-500">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || loading || templates.length === 0}
              >
                {isSubmitting ? '申請中...' : '承認申請'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApprovalFlowDialog;