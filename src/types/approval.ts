export type ApprovalTargetType = 'QUOTE' | 'PURCHASE_ORDER';
export type ApproverType = 'USER' | 'ROLE' | 'DEPARTMENT';
export type ApprovalStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalStepStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';

export interface ApprovalFlowTemplate {
  id: string;
  template_code: string;
  template_name: string;
  description?: string;
  target_type: ApprovalTargetType;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface ApprovalFlowStep {
  id: string;
  template_id: string;
  step_order: number;
  step_name: string;
  description?: string;
  approver_type: ApproverType;
  approver_id: string;
  is_skippable: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface ApprovalFlowInstance {
  id: string;
  template_id: string;
  target_type: ApprovalTargetType;
  target_id: string;
  current_step: number;
  status: ApprovalStatus;
  started_at: string;
  completed_at?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface ApprovalStepRecord {
  id: string;
  instance_id: string;
  step_id: string;
  step_order: number;
  status: ApprovalStepStatus;
  approver_id: string;
  approved_at?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}