import React, { useState } from 'react';
import { Supplier, SupplierType } from '../../../types/master';
import FormField from '../../common/FormField';
import { supabase } from '../../../lib/supabase';

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: () => void;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Supplier>>(
    supplier || {
      supplier_code: '',
      supplier_name: '',
      supplier_name_kana: '',
      supplier_type: SupplierType.MANUFACTURER,
      address: '',
      phone: '',
      email: '',
      contact_person: '',
      contact_phone: '',
      department: '',
      payment_terms: '',
      purchase_terms: '',
      notes: '',
      is_active: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.supplier_code) newErrors.supplier_code = 'Code is required';
    if (!formData.supplier_name) newErrors.supplier_name = 'Name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (supplier) {
        await supabase
          .from('suppliers')
          .update(formData)
          .eq('id', supplier.id);
      } else {
        await supabase
          .from('suppliers')
          .insert([formData]);
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Supplier Code"
          name="supplier_code"
          value={formData.supplier_code}
          onChange={handleChange}
          error={errors.supplier_code}
        />
        <FormField
          label="Supplier Name"
          name="supplier_name"
          value={formData.supplier_name}
          onChange={handleChange}
          error={errors.supplier_name}
        />
      </div>

      <FormField
        label="Supplier Type"
        name="supplier_type"
        as="select"
        value={formData.supplier_type}
        onChange={handleChange}
      >
        {Object.values(SupplierType).map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </FormField>

      <FormField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <FormField
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <FormField
        label="Address"
        name="address"
        as="textarea"
        value={formData.address}
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Contact Person"
          name="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
        />
        <FormField
          label="Contact Phone"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={handleChange}
        />
      </div>

      <FormField
        label="Department"
        name="department"
        value={formData.department}
        onChange={handleChange}
      />

      <FormField
        label="Payment Terms"
        name="payment_terms"
        as="textarea"
        value={formData.payment_terms}
        onChange={handleChange}
      />

      <FormField
        label="Purchase Terms"
        name="purchase_terms"
        as="textarea"
        value={formData.purchase_terms}
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
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {supplier ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;