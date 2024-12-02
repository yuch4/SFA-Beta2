export interface Opportunity {
  id: string;
  name: string;
  amount: number;
  stage: string;
  probability: number;
  expected_close_date: string;
  customer_id: string;
  created_at: string;
}

export interface Quote {
  id: string;
  opportunity_id: string;
  total_amount: number;
  status: string;
  valid_until: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  quote_id: string;
  status: string;
  delivery_date: string;
  total_amount: number;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}