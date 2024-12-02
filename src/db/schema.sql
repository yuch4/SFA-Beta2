-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Common Fields function
CREATE OR REPLACE FUNCTION common_fields() 
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users Profile Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    position VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_name_kana VARCHAR(255),
    customer_type VARCHAR(50) CHECK (customer_type IN ('CORPORATE', 'INDIVIDUAL', 'GOVERNMENT', 'OTHER')),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    department VARCHAR(255),
    payment_terms TEXT,
    credit_limit DECIMAL(15,2),
    transaction_start_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_name_kana VARCHAR(255),
    supplier_type VARCHAR(50) CHECK (supplier_type IN ('MANUFACTURER', 'DISTRIBUTOR', 'SERVICE_PROVIDER', 'OTHER')),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    department VARCHAR(255),
    payment_terms TEXT,
    transaction_start_date DATE,
    purchase_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Project Codes Table
CREATE TABLE project_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Statuses Table
CREATE TABLE statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_code VARCHAR(50) UNIQUE NOT NULL,
    status_name VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL,
    description TEXT,
    color_settings VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

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
    assigned_to UUID REFERENCES auth.users(id),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Case History Table
CREATE TABLE case_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES auth.users(id),
    change_type VARCHAR(50)
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
    uploaded_by UUID REFERENCES auth.users(id),
    version INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false
);

-- Triggers
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION common_fields();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION common_fields();

CREATE TRIGGER update_project_codes_updated_at
    BEFORE UPDATE ON project_codes
    FOR EACH ROW
    EXECUTE FUNCTION common_fields();

CREATE TRIGGER update_statuses_updated_at
    BEFORE UPDATE ON statuses
    FOR EACH ROW
    EXECUTE FUNCTION common_fields();

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION common_fields();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION common_fields();

-- Case History Trigger
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
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON project_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON statuses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON cases
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON case_histories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON case_files
    FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_customer_name ON customers(customer_name);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_is_deleted ON customers(is_deleted);

CREATE INDEX idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_supplier_name ON suppliers(supplier_name);
CREATE INDEX idx_suppliers_supplier_type ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_is_deleted ON suppliers(is_deleted);

CREATE INDEX idx_project_codes_project_code ON project_codes(project_code);
CREATE INDEX idx_project_codes_project_name ON project_codes(project_name);
CREATE INDEX idx_project_codes_is_active ON project_codes(is_active);
CREATE INDEX idx_project_codes_is_deleted ON project_codes(is_deleted);

CREATE INDEX idx_statuses_status_code ON statuses(status_code);
CREATE INDEX idx_statuses_status_name ON statuses(status_name);
CREATE INDEX idx_statuses_display_order ON statuses(display_order);
CREATE INDEX idx_statuses_is_active ON statuses(is_active);
CREATE INDEX idx_statuses_is_deleted ON statuses(is_deleted);

CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_case_name ON cases(case_name);
CREATE INDEX idx_cases_customer_id ON cases(customer_id);
CREATE INDEX idx_cases_project_code_id ON cases(project_code_id);
CREATE INDEX idx_cases_status_id ON cases(status_id);
CREATE INDEX idx_cases_probability ON cases(probability);
CREATE INDEX idx_cases_expected_order_date ON cases(expected_order_date);
CREATE INDEX idx_cases_expected_accounting_date ON cases(expected_accounting_date);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_is_active ON cases(is_active);
CREATE INDEX idx_cases_is_deleted ON cases(is_deleted);

CREATE INDEX idx_case_histories_case_id ON case_histories(case_id);
CREATE INDEX idx_case_histories_changed_at ON case_histories(changed_at);
CREATE INDEX idx_case_histories_changed_by ON case_histories(changed_by);

CREATE INDEX idx_case_files_case_id ON case_files(case_id);
CREATE INDEX idx_case_files_uploaded_by ON case_files(uploaded_by);
CREATE INDEX idx_case_files_is_deleted ON case_files(is_deleted);

-- Insert default statuses
INSERT INTO statuses (status_code, status_name, display_order, color_settings, is_active)
VALUES 
    ('NEW', '新規', 10, '#3B82F6', true),
    ('IN_PROGRESS', '進行中', 20, '#10B981', true),
    ('PENDING', '保留', 30, '#F59E0B', true),
    ('CLOSED_WON', '成約', 40, '#059669', true),
    ('CLOSED_LOST', '失注', 50, '#EF4444', true);