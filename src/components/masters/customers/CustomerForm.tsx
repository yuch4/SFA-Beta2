import React, { useState } from 'react';
import { Customer, CustomerType } from '../../../types/master';
import FormField from '../../common/FormField';
import { supabase } from '../../../lib/supabase';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: () => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      customer_code: '',
      customer_name: '',
      customer_name_kana: '',
      customer_type: CustomerType.CORPORATE,
      address: '',
      phone: '',
      email: '',
      contact_person: '',
      contact_phone: '',
      department: '',
      payment_terms: '',
      credit_limit: 0,
      notes: '',
      is_active: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
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
    if (!formData.customer_code?.trim()) newErrors.customer_code = '顧客コードは必須です';
    if (!formData.customer_name?.trim()) newErrors.customer_name = '顧客名は必須です';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
        
        if (error) throw error;
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving customer:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save customer. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          顧客情報の保存に失敗しました。もう一度お試しください。
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="顧客コード"
          name="customer_code"
          value={formData.customer_code}
          onChange={handleChange}
          error={errors.customer_code}
          required
        />
        <FormField
          label="顧客名"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          error={errors.customer_name}
          required
        />
      </div>

      <FormField
        label="顧客区分"
        name="customer_type"
        as="select"
        value={formData.customer_type}
        onChange={handleChange}
      >
        {Object.values(CustomerType).map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </FormField>

      <FormField
        label="メールアドレス"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <FormField
        label="電話番号"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <FormField
        label="住所"
        name="address"
        as="textarea"
        value={formData.address}
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="担当者名"
          name="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
        />
        <FormField
          label="担当者電話番号"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={handleChange}
        />
      </div>

      <FormField
        label="部署"
        name="department"
        value={formData.department}
        onChange={handleChange}
      />

      <FormField
        label="支払条件"
        name="payment_terms"
        as="textarea"
        value={formData.payment_terms}
        onChange={handleChange}
      />

      <FormField
        label="与信限度額"
        type="number"
        name="credit_limit"
        value={formData.credit_limit}
        onChange={handleChange}
      />

      <FormField
        label="備考"
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
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : customer ? '更新' : '登録'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;