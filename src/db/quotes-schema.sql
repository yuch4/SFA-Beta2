-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Quotes Table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    case_id UUID REFERENCES cases(id),
    quote_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    payment_terms TEXT,
    delivery_date DATE,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    purchase_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    profit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    profit_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    subject TEXT,
    message TEXT,
    notes TEXT,
    internal_memo TEXT,
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    version INTEGER NOT NULL DEFAULT 1,
    revision_reason TEXT,
    revision_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Quote Items Table
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id),
    item_order INTEGER NOT NULL,
    item_type VARCHAR(20) CHECK (item_type IN ('NORMAL', 'SUBTOTAL', 'DISCOUNT')),
    item_name TEXT NOT NULL,
    quantity DECIMAL(15,2),
    unit VARCHAR(50),
    unit_price DECIMAL(15,2),
    supplier_id UUID REFERENCES suppliers(id),
    purchase_unit_price DECIMAL(15,2),
    amount DECIMAL(15,2),
    is_tax_applicable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT unique_item_order UNIQUE (quote_id, item_order)
);

-- Quote History Table
CREATE TABLE quote_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id),
    version INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES user_profiles(id),
    revision_reason TEXT,
    revision_notes TEXT,
    change_type VARCHAR(50)
);

-- Quote Attachments Table
CREATE TABLE quote_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES user_profiles(id),
    is_deleted BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_case_id ON quotes(case_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_by ON quotes(created_by);
CREATE INDEX idx_quotes_updated_by ON quotes(updated_by);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_supplier_id ON quote_items(supplier_id);
CREATE INDEX idx_quote_items_item_order ON quote_items(quote_id, item_order);

CREATE INDEX idx_quote_attachments_quote_id ON quote_attachments(quote_id);
CREATE INDEX idx_quote_attachments_uploaded_by ON quote_attachments(uploaded_by);

CREATE INDEX idx_quote_histories_quote_id ON quote_histories(quote_id);
CREATE INDEX idx_quote_histories_version ON quote_histories(quote_id, version);
CREATE INDEX idx_quote_histories_changed_by ON quote_histories(changed_by);

-- Quote History Trigger Function
CREATE OR REPLACE FUNCTION track_quote_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO quote_histories (
            quote_id,
            version,
            field_name,
            previous_value,
            new_value,
            changed_by,
            revision_reason,
            revision_notes,
            change_type
        )
        SELECT
            NEW.id,
            NEW.version,
            key,
            COALESCE(old_fields.value::text, ''),
            COALESCE(new_fields.value::text, ''),
            NEW.updated_by,
            NEW.revision_reason,
            NEW.revision_notes,
            'UPDATE'
        FROM jsonb_each_text(to_jsonb(OLD)) old_fields
        FULL OUTER JOIN jsonb_each_text(to_jsonb(NEW)) new_fields USING (key)
        WHERE old_fields.value IS DISTINCT FROM new_fields.value
        AND key NOT IN ('updated_at', 'updated_by');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS quote_history_trigger ON quotes;
CREATE TRIGGER quote_history_trigger
    AFTER UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION track_quote_changes();

-- Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_histories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON quotes;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON quotes;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON quotes;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON quotes;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON quote_items;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON quote_items;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON quote_items;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON quote_items;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON quote_attachments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON quote_attachments;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON quote_attachments;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON quote_attachments;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON quote_histories;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON quote_histories;

-- Policies for quotes
CREATE POLICY "Enable read access for authenticated users" ON quotes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON quotes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON quotes
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON quotes
    FOR DELETE TO authenticated USING (true);

-- Policies for quote_items
CREATE POLICY "Enable read access for authenticated users" ON quote_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON quote_items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON quote_items
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON quote_items
    FOR DELETE TO authenticated USING (true);

-- Policies for quote_attachments
CREATE POLICY "Enable read access for authenticated users" ON quote_attachments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON quote_attachments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON quote_attachments
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON quote_attachments
    FOR DELETE TO authenticated USING (true);

-- Policies for quote_histories
CREATE POLICY "Enable read access for authenticated users" ON quote_histories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON quote_histories
    FOR INSERT TO authenticated WITH CHECK (true);

-- Grant permissions
GRANT ALL ON quotes TO authenticated;
GRANT ALL ON quote_items TO authenticated;
GRANT ALL ON quote_attachments TO authenticated;
GRANT ALL ON quote_histories TO authenticated;