export type ApprovalFlowStatus = 'ACTIVE' | 'INACTIVE';
export type ApprovalStepStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalFlow {
  id: string;
  flow_name: string;
  description?: string;
  status: ApprovalFlowStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface ApprovalFlowStep {
  id: string;
  approval_flow_id: string;
  step_order: number;
  approver_id: string;
  approver_name?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface ApprovalRequest {
  id: string;
  approval_flow_id: string;
  request_type: string;
  request_id: string;
  status: ApprovalStepStatus;
  requested_at: string;
  requested_by: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface ApprovalRequestStep {
  id: string;
  approval_request_id: string;
  step_order: number;
  approver_id: string;
  approver_name?: string;
  status: ApprovalStepStatus;
  approved_at?: string;
  rejected_at?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface ApprovalFlowListView {
  id: string;
  flow_name: string;
  description?: string;
  status: ApprovalFlowStatus;
  step_count: number;
  updated_at: string;
  updated_by_name: string;
} 