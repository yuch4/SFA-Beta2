import React, { useState, useEffect } from 'react';
import { Case } from '../../types/case';
import { Customer, ProjectCode, Status } from '../../types/master';
import FormField from '../common/FormField';
import { MasterSearchField } from '../common/MasterSearchField';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import CaseActivityList from './CaseActivityList';

interface CaseFormProps {
  caseData?: Case;
  onSubmit: () => void;
  onCancel: () => void;
}

interface CaseFormData extends Omit<Case, 'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'> {
  expected_revenue: number;
  expected_profit: number;
}

const CaseForm: React.FC<CaseFormProps> = ({ caseData, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CaseFormData>(
    caseData || {
      case_number: '',
      case_name: '',
      customer_id: '',
      project_code_id: '',
      expected_revenue: 0,
      expected_profit: 0,
      status_id: '',
      probability: 'C',
      expected_order_date: '',
      expected_accounting_date: '',
      assigned_to: user?.id || '',
      description: '',
      notes: '',
      is_active: true,
    }
  );

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projectCodes, setProjectCodes] = useState<ProjectCode[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [selectedProjectCode, setSelectedProjectCode] = useState<ProjectCode | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<Status | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [
          { data: customersData },
          { data: projectCodesData },
          { data: statusesData }
        ] = await Promise.all([
          supabase.from('customers').select('*').eq('is_active', true),
          supabase.from('project_codes').select('*').eq('is_active', true),
          supabase.from('statuses').select('*').eq('is_active', true)
        ]);

        setCustomers(customersData || []);
        setProjectCodes(projectCodesData || []);
        setStatuses(statusesData || []);

        // Initialize selected items if editing
        if (caseData) {
          const customer = customersData?.find(c => c.id === caseData.customer_id);
          const projectCode = projectCodesData?.find(p => p.id === caseData.project_code_id);
          const status = statusesData?.find(s => s.id === caseData.status_id);

          setSelectedCustomer(customer);
          setSelectedProjectCode(projectCode);
          setSelectedStatus(status);

          // Update form data with the found references
          setFormData(prev => ({
            ...prev,
            customer_id: customer?.id || '',
            project_code_id: projectCode?.id || '',
            status_id: status?.id || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching master data:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to load master data. Please try again.',
        }));
      }
    };

    fetchMasterData();
  }, [caseData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = value === '' ? 0 : Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.case_name?.trim()) newErrors.case_name = '案件名は必須です';
    if (!formData.customer_id) newErrors.customer_id = '顧客は必須です';
    if (!formData.project_code_id) newErrors.project_code_id = 'プロジェクトコードは必須です';
    if (!formData.status_id) newErrors.status_id = 'ステータスは必須です';
    if (!formData.expected_order_date) newErrors.expected_order_date = '受注予定日は必須です';
    if (!formData.expected_accounting_date) newErrors.expected_accounting_date = '計上予定日は必須です';
    if (formData.expected_revenue! < 0) newErrors.expected_revenue = '予想売上は0以上で入力してください';
    if (formData.expected_profit! < 0) newErrors.expected_profit = '予想利益は0以上で入力してください';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      const caseNumber = caseData?.case_number || `CASE-${Date.now()}`;

      const casePayload = {
        case_number: caseNumber,
        case_name: formData.case_name,
        customer_id: formData.customer_id,
        project_code_id: formData.project_code_id,
        expected_revenue: formData.expected_revenue,
        expected_profit: formData.expected_profit,
        status_id: formData.status_id,
        probability: formData.probability,
        expected_order_date: formData.expected_order_date,
        expected_accounting_date: formData.expected_accounting_date,
        assigned_to: user?.id,
        description: formData.description,
        notes: formData.notes,
        updated_at: now,
        updated_by: user?.id,
        is_active: true
      };

      if (caseData) {
        const { error } = await supabase
          .from('cases')
          .update(casePayload)
          .eq('id', caseData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cases')
          .insert([{
            ...casePayload,
            created_at: now,
            created_by: user?.id,
          }]);
        
        if (error) throw error;
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving case:', error);
      setErrors(prev => ({
        ...prev,
        submit: '案件の保存に失敗しました。もう一度お試しください。',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {errors.submit}
          </div>
        )}

        <FormField
          label="案件名"
          name="case_name"
          value={formData.case_name}
          onChange={handleChange}
          error={errors.case_name}
          required
        />

        <div className="grid grid-cols-2 gap-6">
          <MasterSearchField
            label="顧客"
            selectedItem={selectedCustomer}
            error={errors.customer_id}
            required
            data={customers}
            onSelect={(customer) => {
              setSelectedCustomer(customer);
              setFormData(prev => ({ ...prev, customer_id: customer.id }));
            }}
            renderItem={(customer) => (
              <div>
                <div className="font-medium">{customer.customer_name}</div>
                <div className="text-sm text-gray-500">
                  {customer.customer_code} - {customer.customer_type}
                </div>
              </div>
            )}
            renderSelected={(customer) => `${customer.customer_code} - ${customer.customer_name}`}
            searchFields={['customer_code', 'customer_name', 'customer_name_kana']}
          />

          <MasterSearchField
            label="プロジェクトコード"
            selectedItem={selectedProjectCode}
            error={errors.project_code_id}
            required
            data={projectCodes}
            onSelect={(projectCode) => {
              setSelectedProjectCode(projectCode);
              setFormData(prev => ({ ...prev, project_code_id: projectCode.id }));
            }}
            renderItem={(projectCode) => (
              <div>
                <div className="font-medium">{projectCode.project_name}</div>
                <div className="text-sm text-gray-500">{projectCode.project_code}</div>
              </div>
            )}
            renderSelected={(projectCode) => `${projectCode.project_code} - ${projectCode.project_name}`}
            searchFields={['project_code', 'project_name']}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="予想売上"
            type="number"
            name="expected_revenue"
            value={formData.expected_revenue.toString()}
            onChange={handleChange}
            required
            error={errors.expected_revenue}
            className="text-right"
            suffix="円"
          />

          <FormField
            label="予想利益"
            type="number"
            name="expected_profit"
            value={formData.expected_profit.toString()}
            onChange={handleChange}
            required
            error={errors.expected_profit}
            className="text-right"
            suffix="円"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <MasterSearchField
            label="ステータス"
            selectedItem={selectedStatus}
            error={errors.status_id}
            required
            data={statuses}
            onSelect={(status) => {
              setSelectedStatus(status);
              setFormData(prev => ({ ...prev, status_id: status.id }));
            }}
            renderItem={(status) => (
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: status.color_settings }}
                />
                <div>
                  <div className="font-medium">{status.status_name}</div>
                  <div className="text-sm text-gray-500">{status.status_code}</div>
                </div>
              </div>
            )}
            renderSelected={(status) => status.status_name}
            searchFields={['status_code', 'status_name']}
          />

          <FormField
            label="確度"
            name="probability"
            as="select"
            value={formData.probability}
            onChange={handleChange}
            required
          >
            <option value="S">S (90%以上)</option>
            <option value="A">A (70%以上)</option>
            <option value="B">B (50%以上)</option>
            <option value="C">C (30%以上)</option>
            <option value="D">D (30%未満)</option>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="受注予定日"
            type="date"
            name="expected_order_date"
            value={formData.expected_order_date}
            onChange={handleChange}
            error={errors.expected_order_date}
            required
          />

          <FormField
            label="計上予定日"
            type="date"
            name="expected_accounting_date"
            value={formData.expected_accounting_date}
            onChange={handleChange}
            error={errors.expected_accounting_date}
            required
          />
        </div>

        <FormField
          label="案件概要"
          name="description"
          as="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={4}
        />

        <FormField
          label="備考"
          name="notes"
          as="textarea"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
        />

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : caseData ? '更新' : '登録'}
          </button>
        </div>
      </form>

      {caseData && (
        <CaseActivityList caseId={caseData.id} />
      )}
    </div>
  );
};

export default CaseForm;