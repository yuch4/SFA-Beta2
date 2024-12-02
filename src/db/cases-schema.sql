-- Cases Table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    case_name VARCHAR(200) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    project_code_id UUID REFERENCES project_codes(id),
    expected_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
    expected_profit DECIMAL(15,2) NOT NULL DEFAULT 0,
    status_id UUID REFERENCES statuses(id),
    probability VARCHAR(1) CHECK (probability IN ('S', 'A', 'B', 'C', 'D')),
    expected_order_date DATE,
    expected_accounting_date DATE,
    assigned_to UUID REFERENCES user_profiles(id),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES user_profiles(id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES user_profiles(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES user_profiles(id)
);

-- Case History Table
CREATE TABLE case_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES user_profiles(id),
    change_type VARCHAR(50),
    CONSTRAINT fk_changed_by FOREIGN KEY (changed_by) REFERENCES user_profiles(id)
);

-- Case Files Table
CREATE TABLE case_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES user_profiles(id),
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT fk_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_customer_id ON cases(customer_id);
CREATE INDEX idx_cases_project_code_id ON cases(project_code_id);
CREATE INDEX idx_cases_status_id ON cases(status_id);
CREATE INDEX idx_cases_probability ON cases(probability);
CREATE INDEX idx_cases_expected_order_date ON cases(expected_order_date);
CREATE INDEX idx_cases_expected_accounting_date ON cases(expected_accounting_date);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_updated_by ON cases(updated_by);

CREATE INDEX idx_case_histories_case_id ON case_histories(case_id);
CREATE INDEX idx_case_histories_changed_at ON case_histories(changed_at);
CREATE INDEX idx_case_histories_changed_by ON case_histories(changed_by);

CREATE INDEX idx_case_files_case_id ON case_files(case_id);
CREATE INDEX idx_case_files_uploaded_by ON case_files(uploaded_by);

-- Triggers for history tracking
CREATE OR REPLACE FUNCTION track_case_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO case_histories (
            case_id,
            field_name,
            old_value,
            new_value,
            changed_by,
            change_type
        )
        SELECT
            NEW.id,
            key,
            old_value,
            new_value,
            NEW.updated_by,
            'UPDATE'
        FROM jsonb_each_text(to_jsonb(OLD)) old_fields
        FULL OUTER JOIN jsonb_each_text(to_jsonb(NEW)) new_fields USING (key)
        WHERE old_value IS DISTINCT FROM new_value
        AND key NOT IN ('updated_at', 'updated_by');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_history_trigger
AFTER UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION track_case_changes();

-- Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users" ON cases
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON cases
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON cases
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON cases
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON case_histories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON case_files
    FOR SELECT USING (auth.role() = 'authenticated');