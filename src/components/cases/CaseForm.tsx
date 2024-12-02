import React, { useState, useEffect } from 'react';
import { Case } from '../../types/case';
import { Customer, ProjectCode, Status } from '../../types/master';
import FormField from '../common/FormField';
import { MasterSearchField } from '../common/MasterSearchField';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface CaseFormProps {
  caseData?: Case;
  onSubmit: () => void;
  onCancel: () => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ caseData, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Case>>(
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
    let parsedValue = value;

    if (type === 'number') {
      parsedValue = value === '' ? 0 : parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));

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
    if (!formData.case_name?.trim()) newErrors.case_name = 'Case name is required';
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.project_code_id) newErrors.project_code_id = 'Project code is required';
    if (!formData.status_id) newErrors.status_id = 'Status is required';
    if (!formData.expected_order_date) newErrors.expected_order_date = 'Expected order date is required';
    if (!formData.expected_accounting_date) newErrors.expected_accounting_date = 'Expected accounting date is required';
    if (formData.expected_revenue! < 0) newErrors.expected_revenue = 'Expected revenue must be positive';
    if (formData.expected_profit! < 0) newErrors.expected_profit = 'Expected profit must be positive';
    
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
        ...formData,
        case_number: caseNumber,
        assigned_to: user?.id,
        updated_at: now,
        updated_by: user?.id,
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
        submit: 'Failed to save case. Please try again.',
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
        label="Case Name"
        name="case_name"
        value={formData.case_name}
        onChange={handleChange}
        error={errors.case_name}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <MasterSearchField
          label="Customer"
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
          label="Project Code"
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Expected Revenue"
          type="number"
          name="expected_revenue"
          value={formData.expected_revenue || 0}
          onChange={handleChange}
          min="0"
          required
          error={errors.expected_revenue}
        />

        <FormField
          label="Expected Profit"
          type="number"
          name="expected_profit"
          value={formData.expected_profit || 0}
          onChange={handleChange}
          min="0"
          required
          error={errors.expected_profit}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MasterSearchField
          label="Status"
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
          label="Probability"
          name="probability"
          as="select"
          value={formData.probability}
          onChange={handleChange}
          required
        >
          <option value="S">S</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Expected Order Date"
          type="date"
          name="expected_order_date"
          value={formData.expected_order_date}
          onChange={handleChange}
          error={errors.expected_order_date}
          required
        />

        <FormField
          label="Expected Accounting Date"
          type="date"
          name="expected_accounting_date"
          value={formData.expected_accounting_date}
          onChange={handleChange}
          error={errors.expected_accounting_date}
          required
        />
      </div>

      <FormField
        label="Description"
        name="description"
        as="textarea"
        value={formData.description}
        onChange={handleChange}
      />

      <FormField
        label="Notes"
        name="notes"
        as="textarea"
        value={formData.notes}
        onChange={handleChange}
      />

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
          {isSubmitting ? 'Saving...' : caseData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default CaseForm;