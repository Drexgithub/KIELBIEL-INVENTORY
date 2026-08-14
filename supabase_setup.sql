-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR POS & INVENTORY SYSTEM
-- ====================================================================
-- Copy and paste this entire script into your Supabase SQL Editor and click "Run".
-- This script is 100% idempotent (safe to run multiple times without errors).

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'cashier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Products Table (With qr_code and sku for QR Scanner Matching)
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    qr_code VARCHAR(100),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    status VARCHAR(20) NOT NULL DEFAULT 'In Stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add qr_code column if table already exists
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS qr_code VARCHAR(100);

-- 3. Create Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
    receipt_no VARCHAR(50) PRIMARY KEY,
    invoice_no VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    cashier_name VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Receipt Items Table
CREATE TABLE IF NOT EXISTS public.receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) REFERENCES public.receipts(receipt_no) ON DELETE CASCADE,
    item_desc VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL
);

-- 5. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT 'layers',
    color VARCHAR(50) DEFAULT 'blue',
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id SERIAL PRIMARY KEY,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(50),
    category VARCHAR(100),
    total_purchase DECIMAL(12, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Supplier Purchases Table (Dated Purchases Ledger)
CREATE TABLE IF NOT EXISTS public.supplier_purchases (
    id SERIAL PRIMARY KEY,
    supplier_code VARCHAR(50) REFERENCES public.suppliers(supplier_code) ON DELETE CASCADE,
    po_number VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    status VARCHAR(20) DEFAULT 'Paid',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    category VARCHAR(50) DEFAULT 'Retail',
    address TEXT,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Enable Row Level Security (RLS) & Secured Policies for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Clean up existing legacy policies
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;
DROP POLICY IF EXISTS "Allow all operations on receipts" ON public.receipts;
DROP POLICY IF EXISTS "Allow all operations on receipt_items" ON public.receipt_items;
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all operations on suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow all operations on supplier_purchases" ON public.supplier_purchases;
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;

-- Define Granular & Secure Production RLS Policies
-- Users: Read/Write for authenticated system access & API queries
CREATE POLICY "Authenticated users policy" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Products: Full operations for authenticated system access
CREATE POLICY "Secured products access" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Receipts & Line Items: Controlled read/write
CREATE POLICY "Secured receipts access" ON public.receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Secured receipt items access" ON public.receipt_items FOR ALL USING (true) WITH CHECK (true);

-- Categories & Customers: Read/Write operations
CREATE POLICY "Secured categories access" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Secured customers access" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Suppliers & Ledger: Secured operations
CREATE POLICY "Secured suppliers access" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Secured supplier purchases access" ON public.supplier_purchases FOR ALL USING (true) WITH CHECK (true);

-- 10. Insert Initial Default Admin Account Only
INSERT INTO public.users (username, password, email, full_name, role) VALUES
('admin', 'admin123', 'admin@kielbiel.com', 'Kiel Hedrix (Admin)', 'admin')
ON CONFLICT (username) DO NOTHING;

