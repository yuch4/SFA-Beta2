-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Purchase Orders Table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    case_id UUID REFERENCES cases(id),
    quote_id UUID REFERENCES quotes(id),
    supplier_id UUID REFERENCES suppliers(id),
    po_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    payment_terms TEXT,
    delivery_location TEXT,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    subject TEXT,
    message TEXT,
    notes TEXT,
    internal_memo TEXT,
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'ORDERED', 'DELIVERED', 'COMPLETED')),
    version INTEGER NOT NULL DEFAULT 1,
    cancellation_reason TEXT,
    cancellation_date TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false
);

-- Purchase Order Items Table
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id),
    quote_item_id UUID REFERENCES quote_items(id),
    item_order INTEGER NOT NULL,
    item_code VARCHAR(100),
    item_name TEXT NOT NULL,
    specifications TEXT,
    quantity DECIMAL(15,2),
    unit VARCHAR(50),
    unit_price DECIMAL(15,2),
    amount DECIMAL(15,2),
    notes TEXT,
    internal_memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT unique_po_item_order UNIQUE (po_id, item_order)
);

-- Purchase Order Attachments Table
CREATE TABLE purchase_order_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES user_profiles(id),
    is_deleted BOOLEAN DEFAULT false
);

-- Purchase Order Delivery Table
CREATE TABLE purchase_order_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id),
    expected_date DATE NOT NULL,
    actual_date DATE,
    delay_days INTEGER,
    delay_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_case_id ON purchase_orders(case_id);
CREATE INDEX idx_purchase_orders_quote_id ON purchase_orders(quote_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_delivery_date ON purchase_orders(delivery_date);

CREATE INDEX idx_po_items_po_id ON purchase_order_items(po_id);
CREATE INDEX idx_po_items_quote_item_id ON purchase_order_items(quote_item_id);
CREATE INDEX idx_po_items_item_order ON purchase_order_items(po_id, item_order);

CREATE INDEX idx_po_attachments_po_id ON purchase_order_attachments(po_id);
CREATE INDEX idx_po_attachments_uploaded_by ON purchase_order_attachments(uploaded_by);

CREATE INDEX idx_po_deliveries_po_id ON purchase_order_deliveries(po_id);
CREATE INDEX idx_po_deliveries_expected_date ON purchase_order_deliveries(expected_date);
CREATE INDEX idx_po_deliveries_actual_date ON purchase_order_deliveries(actual_date);

-- Row Level Security
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_deliveries ENABLE ROW LEVEL SECURITY;

-- Policies for purchase_orders
CREATE POLICY "Enable read access for authenticated users" ON purchase_orders
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON purchase_orders
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchase_orders
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON purchase_orders
    FOR DELETE TO authenticated USING (true);

-- Policies for purchase_order_items
CREATE POLICY "Enable read access for authenticated users" ON purchase_order_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON purchase_order_items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchase_order_items
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON purchase_order_items
    FOR DELETE TO authenticated USING (true);

-- Policies for purchase_order_attachments
CREATE POLICY "Enable read access for authenticated users" ON purchase_order_attachments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON purchase_order_attachments
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchase_order_attachments
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON purchase_order_attachments
    FOR DELETE TO authenticated USING (true);

-- Policies for purchase_order_deliveries
CREATE POLICY "Enable read access for authenticated users" ON purchase_order_deliveries
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON purchase_order_deliveries
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchase_order_deliveries
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON purchase_order_deliveries
    FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;
GRANT ALL ON purchase_order_attachments TO authenticated;
GRANT ALL ON purchase_order_deliveries TO authenticated;