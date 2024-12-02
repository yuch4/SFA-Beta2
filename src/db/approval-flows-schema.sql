-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Approval Flow Templates Table
CREATE TABLE approval_flow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_code VARCHAR(50) UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_type VARCHAR(20) CHECK (target_type IN ('QUOTE', 'PURCHASE_ORDER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Approval Flow Steps Table
CREATE TABLE approval_flow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES approval_flow_templates(id),
    step_order INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    description TEXT,
    approver_type VARCHAR(20) CHECK (approver_type IN ('USER', 'ROLE', 'DEPARTMENT')),
    approver_id UUID,
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES approval_flow_templates(id),
    target_type VARCHAR(20) CHECK (target_type IN ('QUOTE', 'PURCHASE_ORDER')),
    target_id UUID NOT NULL,
    current_step INTEGER,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id)
);

-- Approval Step Records Table
CREATE TABLE approval_step_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID REFERENCES approval_flow_instances(id),
    step_id UUID REFERENCES approval_flow_steps(id),
    step_order INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED')),
    approver_id UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_approval_templates_code ON approval_flow_templates(template_code);
CREATE INDEX idx_approval_templates_type ON approval_flow_templates(target_type);
CREATE INDEX idx_approval_steps_template ON approval_flow_steps(template_id, step_order);
CREATE INDEX idx_approval_instances_template ON approval_flow_instances(template_id);
CREATE INDEX idx_approval_instances_target ON approval_flow_instances(target_type, target_id);
CREATE INDEX idx_approval_records_instance ON approval_step_records(instance_id);
CREATE INDEX idx_approval_records_step ON approval_step_records(step_id);

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
CREATE POLICY "Enable read access for authenticated users" ON approval_flow_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON approval_flow_templates
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for authenticated users" ON approval_flow_templates
    FOR UPDATE TO authenticated USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Enable delete access for authenticated users" ON approval_flow_templates
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Policies for approval_flow_steps
CREATE POLICY "Enable read access for authenticated users" ON approval_flow_steps
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON approval_flow_steps
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for authenticated users" ON approval_flow_steps
    FOR UPDATE TO authenticated USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Enable delete access for authenticated users" ON approval_flow_steps
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Policies for approval_flow_instances
CREATE POLICY "Enable read access for authenticated users" ON approval_flow_instances
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON approval_flow_instances
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for authenticated users" ON approval_flow_instances
    FOR UPDATE TO authenticated USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Enable delete access for authenticated users" ON approval_flow_instances
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Policies for approval_step_records
CREATE POLICY "Enable read access for authenticated users" ON approval_step_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON approval_step_records
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON approval_step_records
    FOR UPDATE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON approval_flow_templates TO authenticated;
GRANT ALL ON approval_flow_steps TO authenticated;
GRANT ALL ON approval_flow_instances TO authenticated;
GRANT ALL ON approval_step_records TO authenticated;