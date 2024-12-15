import React, { useState } from 'react';
import { Status } from '../../../types/master';
import FormField from '../../common/FormField';
import { supabase } from '../../../lib/supabase';

interface StatusFormProps {
  status?: Status;
  onSubmit: () => void;
  onCancel: () => void;
}

const StatusForm: React.FC<StatusFormProps> = ({ status, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Status>>(
    status || {
      status_code: '',
      status_name: '',
      display_order: 0,
      description: '',
      color_settings: '#3B82F6',
      is_active: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.status_code) newErrors.status_code = 'ステータスコードは必須です';
    if (!formData.status_name) newErrors.status_name = 'ステータス名は必須です';
    if (formData.display_order === undefined || formData.display_order < 0) {
      newErrors.display_order = '表示順は0以上の数値を入力してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (status) {
        await supabase
          .from('statuses')
          .update(formData)
          .eq('id', status.id);
      } else {
        await supabase
          .from('statuses')
          .insert([formData]);
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving status:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="ステータスコード"
          name="status_code"
          value={formData.status_code}
          onChange={handleChange}
          error={errors.status_code}
        />
        <FormField
          label="ステータス名"
          name="status_name"
          value={formData.status_name}
          onChange={handleChange}
          error={errors.status_name}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="表示順"
          type="number"
          name="display_order"
          value={formData.display_order}
          onChange={handleChange}
          error={errors.display_order}
        />
        <FormField
          label="表示色"
          type="color"
          name="color_settings"
          value={formData.color_settings}
          onChange={handleChange}
        />
      </div>

      <FormField
        label="説明"
        name="description"
        as="textarea"
        value={formData.description}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {status ? '更新' : '登録'}
        </button>
      </div>
    </form>
  );
};

export default StatusForm;