export type QuoteStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type QuoteItemType = 'NORMAL' | 'SUBTOTAL' | 'DISCOUNT';

export interface BaseEntity {
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface Quote extends BaseEntity {
  quote_number: string;
  case_id: string;
  quote_date: string;
  valid_until: string;
  customer_id: string;
  payment_terms: string;
  delivery_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  purchase_cost: number;
  profit_amount: number;
  profit_rate: number;
  subject?: string;
  message?: string;
  notes?: string;
  internal_memo?: string;
  status: QuoteStatus;
}

export interface QuoteItem extends BaseEntity {
  quote_id: string;
  item_order: number;
  item_type: QuoteItemType;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  supplier_id?: string;
  suppliers?: {
    id: string;
    supplier_code: string;
    supplier_name: string;
  };
  purchase_unit_price: number;
  amount: number;
  is_tax_applicable: boolean;
}

export interface QuoteAttachment {
  id: string;
  quote_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by?: string;
  is_deleted: boolean;
}

export interface QuoteListView {
  id: string;
  quote_number: string;
  case_name: string;
  customer_name: string;
  quote_date: string;
  valid_until: string;
  total_amount: number;
  profit_rate: number;
  status: QuoteStatus;
  updated_at: string;
}