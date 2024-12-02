export interface BaseEntity {
  id: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  is_active: boolean;
  is_deleted: boolean;
}

export enum CustomerType {
  CORPORATE = 'CORPORATE',
  INDIVIDUAL = 'INDIVIDUAL',
  GOVERNMENT = 'GOVERNMENT',
  OTHER = 'OTHER'
}

export enum SupplierType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  OTHER = 'OTHER'
}

export interface Customer extends BaseEntity {
  customer_code: string;
  customer_name: string;
  customer_name_kana: string;
  customer_type: CustomerType;
  address: string;
  phone: string;
  email: string;
  contact_person: string;
  contact_phone: string;
  department: string;
  payment_terms: string;
  credit_limit: number;
  transaction_start_date?: string;
  notes: string;
}

export interface Supplier extends BaseEntity {
  supplier_code: string;
  supplier_name: string;
  supplier_name_kana: string;
  supplier_type: SupplierType;
  address: string;
  phone: string;
  email: string;
  contact_person: string;
  contact_phone: string;
  department: string;
  payment_terms: string;
  purchase_terms: string;
  transaction_start_date?: string;
  notes: string;
}

export interface ProjectCode extends BaseEntity {
  project_code: string;
  project_name: string;
}

export interface Status extends BaseEntity {
  status_code: string;
  status_name: string;
  display_order: number;
  description: string;
  color_settings: string;
}