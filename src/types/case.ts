import { BaseEntity } from './master';

export interface Case extends BaseEntity {
  case_number: string;
  case_name: string;
  customer_id: string;
  project_code_id: string;
  expected_revenue: number;
  expected_profit: number;
  status_id: string;
  probability: 'S' | 'A' | 'B' | 'C' | 'D';
  expected_order_date: string;
  expected_accounting_date: string;
  assigned_to: string;
  description?: string;
  notes?: string;
}

export interface CaseHistory {
  id: string;
  case_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  changed_by: string | null;
  change_type: string;
}

export interface CaseFile {
  id: string;
  case_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string | null;
  version: number;
  is_deleted: boolean;
}

export interface CaseListView {
  id: string;
  case_number: string;
  case_name: string;
  customer_name: string;
  expected_revenue: number;
  expected_profit: number;
  status_name: string;
  probability: string;
  expected_order_date: string;
  expected_accounting_date: string;
  assigned_to_name: string;
  updated_at: string;
}