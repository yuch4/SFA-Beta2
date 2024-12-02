import React from 'react';
import { Case } from '../../types/case';
import { Quote } from '../../types/quote';
import { Supplier } from '../../types/master';
import { PurchaseOrderStatus } from '../../types/purchase-order';
import FormField from '../common/FormField';
import { MasterSearchField } from '../common/MasterSearchField';
import { PurchaseOrderStatusSelect } from './PurchaseOrderStatus';

interface PurchaseOrderBasicInfoProps {
  formData: any;
  selectedCase?: Case;
  selectedQuote?: Quote;
  selectedSupplier?: Supplier;
  cases: Case[];
  quotes: Quote[];
  suppliers: Supplier[];
  errors: Record<string, string>;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCaseSelect: (caseItem: Case) => void;
  onQuoteSelect: (quote: Quote) => void;
  onSupplierSelect: (supplier: Supplier) => void;
  onStatusChange: (status: PurchaseOrderStatus) => void;
}

const PurchaseOrderBasicInfo: React.FC<PurchaseOrderBasicInfoProps> = ({
  formData,
  selectedCase,
  selectedQuote,
  selectedSupplier,
  cases,
  quotes,
  suppliers,
  errors,
  onFieldChange,
  onCaseSelect,
  onQuoteSelect,
  onSupplierSelect,
  onStatusChange,
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
          label="見積書"
          selectedItem={selectedQuote}
          error={errors.quote_id}
          data={quotes}
          onSelect={onQuoteSelect}
          renderItem={(quote) => (
            <div>
              <div className="font-medium">{quote.quote_number}</div>
              <div className="text-sm text-gray-500">
                {new Date(quote.quote_date).toLocaleDateString()}
              </div>
            </div>
          )}
          renderSelected={(quote) => quote.quote_number}
          searchFields={['quote_number']}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <MasterSearchField
          label="仕入先"
          selectedItem={selectedSupplier}
          error={errors.supplier_id}
          required
          data={suppliers}
          onSelect={onSupplierSelect}
          renderItem={(supplier) => (
            <div>
              <div className="font-medium">{supplier.supplier_name}</div>
              <div className="text-sm text-gray-500">
                {supplier.supplier_code} - {supplier.supplier_type}
              </div>
            </div>
          )}
          renderSelected={(supplier) => `${supplier.supplier_code} - ${supplier.supplier_name}`}
          searchFields={['supplier_code', 'supplier_name', 'supplier_name_kana']}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <PurchaseOrderStatusSelect
            status={formData.status}
            onChange={onStatusChange}
          />
        </div>
      </div>

      <FormField
        label="支払条件"
        name="payment_terms"
        as="textarea"
        value={formData.payment_terms}
        onChange={onFieldChange}
        rows={2}
      />

      <div className="grid grid-cols-3 gap-6">
        <FormField
          label="発注日付"
          type="date"
          name="po_date"
          value={formData.po_date}
          onChange={onFieldChange}
          error={errors.po_date}
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

        <FormField
          label="納品場所"
          name="delivery_location"
          value={formData.delivery_location}
          onChange={onFieldChange}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <FormField
          label="消費税"
          type="text"
          name="tax_amount"
          value={formData.tax_amount.toLocaleString()}
          readOnly
          className="bg-gray-50 font-medium"
        />

        <FormField
          label="発注金額"
          type="text"
          name="total_amount"
          value={formData.total_amount.toLocaleString()}
          readOnly
          className="bg-gray-50 font-medium"
        />
      </div>

      <FormField
        label="件名"
        name="subject"
        value={formData.subject}
        onChange={onFieldChange}
        placeholder="発注書の件名を入力してください"
      />

      <FormField
        label="発注書メッセージ"
        name="message"
        as="textarea"
        value={formData.message}
        onChange={onFieldChange}
        placeholder="発注書に表示するメッセージを入力してください"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="備考"
          name="notes"
          as="textarea"
          value={formData.notes}
          onChange={onFieldChange}
          placeholder="発注書に表示する備考を入力してください"
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

export default PurchaseOrderBasicInfo;