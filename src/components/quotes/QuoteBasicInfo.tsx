import React from 'react';
import { Case } from '../../types/case';
import { Customer } from '../../types/master';
import FormField from '../common/FormField';
import { MasterSearchField } from '../common/MasterSearchField';

interface QuoteBasicInfoProps {
  formData: any;
  selectedCase?: Case;
  selectedCustomer?: Customer;
  cases: Case[];
  customers: Customer[];
  errors: Record<string, string>;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCaseSelect: (caseItem: Case) => void;
  onCustomerSelect: (customer: Customer) => void;
}

const QuoteBasicInfo: React.FC<QuoteBasicInfoProps> = ({
  formData,
  selectedCase,
  selectedCustomer,
  cases,
  customers,
  errors,
  onFieldChange,
  onCaseSelect,
  onCustomerSelect,
}) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <MasterSearchField
          label="案件"
          selectedItem={selectedCase}
          error={errors.case_id}
          required
          data={cases}
          onSelect={onCaseSelect}
          renderItem={(caseItem) => (
            <div>
              <div className="font-medium">{caseItem.case_name}</div>
              <div className="text-sm text-gray-500">{caseItem.case_number}</div>
            </div>
          )}
          renderSelected={(caseItem) => `${caseItem.case_number} - ${caseItem.case_name}`}
          searchFields={['case_number', 'case_name']}
        />

        <MasterSearchField
          label="顧客"
          selectedItem={selectedCustomer}
          error={errors.customer_id}
          required
          data={customers}
          onSelect={onCustomerSelect}
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
      </div>

      <div className="grid grid-cols-3 gap-6">
        <FormField
          label="見積日付"
          type="date"
          name="quote_date"
          value={formData.quote_date}
          onChange={onFieldChange}
          error={errors.quote_date}
          required
        />

        <FormField
          label="有効期限"
          type="date"
          name="valid_until"
          value={formData.valid_until}
          onChange={onFieldChange}
          error={errors.valid_until}
          required
        />

        <FormField
          label="納期"
          type="date"
          name="delivery_date"
          value={formData.delivery_date}
          onChange={onFieldChange}
          error={errors.delivery_date}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <FormField
          label="消費税"
          type="text"
          name="tax_amount"
          value={formData.tax_amount?.toLocaleString() || '0'}
          readOnly
          className="bg-gray-50 font-medium"
        />

        <FormField
          label="見積金額"
          type="text"
          name="total_amount"
          value={formData.total_amount?.toLocaleString() || '0'}
          readOnly
          className="bg-gray-50 font-medium"
        />

        <FormField
          label="粗利率"
          type="text"
          name="profit_rate"
          value={`${(formData.profit_rate || 0).toFixed(1)}%`}
          readOnly
          className="bg-gray-50 font-medium"
        />
      </div>

      <FormField
        label="件名"
        name="subject"
        value={formData.subject}
        onChange={onFieldChange}
        placeholder="見積書の件名を入力してください"
      />

      <FormField
        label="支払条件"
        name="payment_terms"
        as="textarea"
        value={formData.payment_terms}
        onChange={onFieldChange}
        placeholder="支払条件を入力してください"
        rows={2}
      />

      <FormField
        label="見積書メッセージ"
        name="message"
        as="textarea"
        value={formData.message}
        onChange={onFieldChange}
        placeholder="見積書に表示するメッセージを入力してください"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="備考"
          name="notes"
          as="textarea"
          value={formData.notes}
          onChange={onFieldChange}
          placeholder="見積書に表示する備考を入力してください"
          rows={3}
        />

        <FormField
          label="社内メモ"
          name="internal_memo"
          as="textarea"
          value={formData.internal_memo}
          onChange={onFieldChange}
          placeholder="社内用のメモを入力してください"
          rows={3}
        />
      </div>
    </div>
  );
};

export default QuoteBasicInfo;