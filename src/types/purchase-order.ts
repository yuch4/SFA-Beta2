export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'DELIVERED' | 'COMPLETED';

export interface PurchaseOrder extends BaseEntity {
  po_number: string;
  case_id: string;
  quote_id?: string;
  supplier_id: string;
  po_date: string;
  delivery_date: string;
  payment_terms?: string;
  delivery_location?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  subject?: string;
  message?: string;
  notes?: string;
  internal_memo?: string;
  status: PurchaseOrderStatus;
  version: number;
  cancellation_reason?: string;
  cancellation_date?: string;
  cancelled_by?: string;
}

export interface PurchaseOrderItem extends BaseEntity {
  po_id: string;
  quote_item_id?: string;
  item_order: number;
  item_code?: string;
  item_name: string;
  specifications?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  notes?: string;
  internal_memo?: string;
}

export interface PurchaseOrderAttachment {
  id: string;
  po_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by?: string;
  is_deleted: boolean;
}

export interface PurchaseOrderDelivery {
  id: string;
  po_id: string;
  expected_date: string;
  actual_date?: string;
  delay_days?: number;
  delay_reason?: string;
  notes?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface PurchaseOrderListView {
  id: string;
  po_number: string;
  case_name: string;
  quote_number?: string;
  supplier_name: string;
  po_date: string;
  delivery_date: string;
  total_amount: number;
  status: PurchaseOrderStatus;
  version: number;
  updated_at: string;
}