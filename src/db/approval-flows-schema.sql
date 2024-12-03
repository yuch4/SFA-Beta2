-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Approval Flow Templates Table
CREATE TABLE approval_flow_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_code VARCHAR NOT NULL UNIQUE,
    template_name VARCHAR NOT NULL,
    description TEXT,
    target_type VARCHAR NOT NULL CHECK (target_type IN ('QUOTE', 'PURCHASE_ORDER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Approval Flow Steps Table
CREATE TABLE approval_flow_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES approval_flow_templates(id),
    step_order INTEGER NOT NULL,
    step_name VARCHAR NOT NULL,
    description TEXT,
    approver_type VARCHAR NOT NULL CHECK (approver_type IN ('USER', 'ROLE', 'DEPARTMENT')),
    approver_id UUID NOT NULL,
    is_skippable BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT unique_template_step_order UNIQUE (template_id, step_order)
);

-- Approval Flow Instances Table
CREATE TABLE approval_flow_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES approval_flow_templates(id),
    target_type VARCHAR NOT NULL CHECK (target_type IN ('QUOTE', 'PURCHASE_ORDER')),
    target_id UUID NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 1,
    status VARCHAR NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id)
);

-- Approval Step Records Table
CREATE TABLE approval_step_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    instance_id UUID REFERENCES approval_flow_instances(id),
    step_id UUID REFERENCES approval_flow_steps(id),
    step_order INTEGER NOT NULL,
    status VARCHAR NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED')),
    approver_id UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_approval_flow_templates_code ON approval_flow_templates(template_code);
CREATE INDEX idx_approval_flow_templates_target ON approval_flow_templates(target_type);
CREATE INDEX idx_approval_flow_steps_template ON approval_flow_steps(template_id);
CREATE INDEX idx_approval_flow_instances_template ON approval_flow_instances(template_id);
CREATE INDEX idx_approval_flow_instances_target ON approval_flow_instances(target_type, target_id);
CREATE INDEX idx_approval_step_records_instance ON approval_step_records(instance_id);

-- Row Level Security
ALTER TABLE approval_flow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_flow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_step_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON approval_flow_templates;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON approval_flow_templates;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON approval_flow_templates;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON approval_flow_templates;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON approval_flow_steps;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON approval_flow_steps;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON approval_flow_steps;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON approval_flow_steps;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON approval_flow_instances;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON approval_flow_instances;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON approval_flow_instances;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON approval_flow_instances;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON approval_step_records;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON approval_step_records;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON approval_step_records;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON approval_step_records;

-- Policies for approval_flow_templates
CREATE POLICY approval_flow_templates_select ON approval_flow_templates 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY approval_flow_templates_insert ON approval_flow_templates 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY approval_flow_templates_update ON approval_flow_templates 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for approval_flow_steps
CREATE POLICY approval_flow_steps_select ON approval_flow_steps 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY approval_flow_steps_insert ON approval_flow_steps 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY approval_flow_steps_update ON approval_flow_steps 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for approval_flow_instances
CREATE POLICY approval_flow_instances_select ON approval_flow_instances 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY approval_flow_instances_insert ON approval_flow_instances 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY approval_flow_instances_update ON approval_flow_instances 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for approval_step_records
CREATE POLICY approval_step_records_select ON approval_step_records 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY approval_step_records_insert ON approval_step_records 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY approval_step_records_update ON approval_step_records 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON approval_flow_templates TO authenticated;
GRANT ALL ON approval_flow_steps TO authenticated;
GRANT ALL ON approval_flow_instances TO authenticated;
GRANT ALL ON approval_step_records TO authenticated;