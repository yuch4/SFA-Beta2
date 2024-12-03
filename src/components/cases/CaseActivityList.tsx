import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CaseActivity, ActivityType } from '../../types/case';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import Modal from '../common/Modal';
import FormField from '../common/FormField';

interface CaseActivityListProps {
  caseId: string;
}

const activityTypeLabels: Record<ActivityType, string> = {
  meeting: '打ち合わせ',
  call: '電話',
  email: 'メール',
  visit: '訪問',
  other: 'その他'
};

const CaseActivityList: React.FC<CaseActivityListProps> = ({ caseId }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'meeting' as ActivityType,
    activity_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    title: '',
    description: '',
    next_action: '',
    next_action_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [caseId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('case_activities')
        .select('*')
        .eq('case_id', caseId)
        .eq('is_deleted', false)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const { error } = await supabase
        .from('case_activities')
        .insert([{
          case_id: caseId,
          ...formData,
          created_by: user?.id,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      fetchActivities();
      setFormData({
        activity_type: 'meeting',
        activity_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
        title: '',
        description: '',
        next_action: '',
        next_action_date: ''
      });
    } catch (error) {
      console.error('Error saving activity:', error);
      setError('活動の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">活動履歴</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          活動を追加
        </button>
      </div>

      <div className="space-y-4">
        {activities.map(activity => (
          <div
            key={activity.id}
            className="bg-white p-4 rounded-lg border border-gray-200 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mr-2">
                  {activityTypeLabels[activity.activity_type]}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(activity.activity_date), 'yyyy/MM/dd HH:mm')}
                </span>
              </div>
            </div>
            <h4 className="font-medium">{activity.title}</h4>
            {activity.description && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{activity.description}</p>
            )}
            {(activity.next_action || activity.next_action_date) && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <h5 className="text-sm font-medium text-gray-900">次のアクション</h5>
                {activity.next_action && (
                  <p className="text-sm text-gray-600">{activity.next_action}</p>
                )}
                {activity.next_action_date && (
                  <p className="text-sm text-gray-500">
                    期限: {format(new Date(activity.next_action_date), 'yyyy/MM/dd')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="活動を追加"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="活動種別"
              name="activity_type"
              as="select"
              value={formData.activity_type}
              onChange={handleChange}
              required
            >
              {Object.entries(activityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </FormField>

            <FormField
              label="活動日時"
              type="datetime-local"
              name="activity_date"
              value={formData.activity_date}
              onChange={handleChange}
              required
            />
          </div>

          <FormField
            label="タイトル"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <FormField
            label="内容"
            name="description"
            as="textarea"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />

          <FormField
            label="次のアクション"
            name="next_action"
            as="textarea"
            value={formData.next_action}
            onChange={handleChange}
            rows={2}
          />

          <FormField
            label="次のアクション期限"
            type="date"
            name="next_action_date"
            value={formData.next_action_date}
            onChange={handleChange}
          />

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CaseActivityList; 