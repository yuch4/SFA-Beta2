import React, { useState } from 'react';
import { ProjectCode } from '../../../types/master';
import FormField from '../../common/FormField';
import { supabase } from '../../../lib/supabase';

interface ProjectCodeFormProps {
  projectCode?: ProjectCode;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProjectCodeForm: React.FC<ProjectCodeFormProps> = ({ projectCode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ProjectCode>>(
    projectCode || {
      project_code: '',
      project_name: '',
      is_active: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.project_code?.trim()) newErrors.project_code = 'Project code is required';
    if (!formData.project_name?.trim()) newErrors.project_name = 'Project name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (projectCode) {
        const { error } = await supabase
          .from('project_codes')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectCode.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_codes')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
        
        if (error) throw error;
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving project code:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save project code. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {errors.submit}
        </div>
      )}

      <FormField
        label="Project Code"
        name="project_code"
        value={formData.project_code}
        onChange={handleChange}
        error={errors.project_code}
        required
      />

      <FormField
        label="Project Name"
        name="project_name"
        value={formData.project_name}
        onChange={handleChange}
        error={errors.project_name}
        required
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : projectCode ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default ProjectCodeForm;