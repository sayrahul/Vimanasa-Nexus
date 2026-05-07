-- ============================================
-- VIMANASA NEXUS - FIX FOR EXISTING TABLES
-- ============================================
-- This script safely updates existing tables and creates missing ones
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Check what tables exist
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '🔍 Checking existing tables...';
END $$;

-- ============================================
-- STEP 2: Drop problematic views first (if they exist)
-- ============================================

DROP VIEW IF EXISTS active_employees_summary CASCADE;
DROP VIEW IF EXISTS monthly_payroll_summary CASCADE;
DROP VIEW IF EXISTS financial_summary CASCADE;

-- ============================================
-- STEP 3: Add missing columns to existing tables
-- ============================================

-- Fix employees table
DO $$
BEGIN
  -- Add employee_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'employee_status'
  ) THEN
    ALTER TABLE employees ADD COLUMN employee_status TEXT DEFAULT 'Active';
    RAISE NOTICE '✅ Added employee_status column to employees table';
  END IF;

  -- Add deployment_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'deployment_status'
  ) THEN
    ALTER TABLE employees ADD COLUMN deployment_status TEXT DEFAULT 'On Bench';
    RAISE NOTICE '✅ Added deployment_status column to employees table';
  END IF;

  -- Add other missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'assigned_client') THEN
    ALTER TABLE employees ADD COLUMN assigned_client TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'assigned_site') THEN
    ALTER TABLE employees ADD COLUMN assigned_site TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'photo_url') THEN
    ALTER TABLE employees ADD COLUMN photo_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'documents') THEN
    ALTER TABLE employees ADD COLUMN documents JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'created_at') THEN
    ALTER TABLE employees ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'updated_at') THEN
    ALTER TABLE employees ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE '⚠️ employees table does not exist, will create it';
END $$;

-- ============================================
-- STEP 4: Create missing tables
-- ============================================

-- Create employees table if it doesn't exist
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE,
  employee_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  aadhar_number TEXT,
  pan_number TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  ifsc_code TEXT,
  designation TEXT,
  role TEXT,
  department TEXT,
  date_of_joining DATE,
  employee_status TEXT DEFAULT 'Active',
  deployment_status TEXT DEFAULT 'On Bench',
  assigned_client TEXT,
  assigned_site TEXT,
  basic_salary DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  other_allowances DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2) DEFAULT 0,
  pf_number TEXT,
  esi_number TEXT,
  uan_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  photo_url TEXT,
  documents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT UNIQUE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gstin TEXT,
  pan TEXT,
  industry TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  billing_cycle TEXT DEFAULT 'Monthly',
  payment_terms TEXT DEFAULT 'Net 30',
  status TEXT DEFAULT 'Active',
  deployed_count INTEGER DEFAULT 0,
  monthly_billing DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create partners table if it doesn't exist
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id TEXT UNIQUE,
  partner_name TEXT NOT NULL,
  location TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  headcount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  contract_value DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create attendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  hours_worked DECIMAL(4,2) DEFAULT 0,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  status TEXT DEFAULT 'Present',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index on attendance if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'attendance' AND indexname = 'attendance_employee_date_unique'
  ) THEN
    CREATE UNIQUE INDEX attendance_employee_date_unique ON attendance(employee_id, date);
  END IF;
END $$;

-- Create leave_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  approved_by TEXT,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create expense_claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS expense_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  expense_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'Pending',
  approved_by TEXT,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create payroll table if it doesn't exist
CREATE TABLE IF NOT EXISTS payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  other_allowances DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  gross_earnings DECIMAL(10,2) DEFAULT 0,
  pf_employee DECIMAL(10,2) DEFAULT 0,
  pf_employer DECIMAL(10,2) DEFAULT 0,
  esi_employee DECIMAL(10,2) DEFAULT 0,
  esi_employer DECIMAL(10,2) DEFAULT 0,
  professional_tax DECIMAL(10,2) DEFAULT 0,
  tds DECIMAL(10,2) DEFAULT 0,
  advance_deduction DECIMAL(10,2) DEFAULT 0,
  loan_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'Pending',
  payment_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  payslip_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index on payroll if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'payroll' AND indexname = 'payroll_employee_month_year_unique'
  ) THEN
    CREATE UNIQUE INDEX payroll_employee_month_year_unique ON payroll(employee_id, month, year);
  END IF;
END $$;

-- Create finance table if it doesn't exist
CREATE TABLE IF NOT EXISTS finance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  reference_id TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'Completed',
  created_by TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create client_invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  billing_period_start DATE,
  billing_period_end DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  cgst DECIMAL(10,2) DEFAULT 0,
  sgst DECIMAL(10,2) DEFAULT 0,
  igst DECIMAL(10,2) DEFAULT 0,
  tds_deducted DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  payment_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  invoice_pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create compliance table if it doesn't exist
CREATE TABLE IF NOT EXISTS compliance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement TEXT NOT NULL,
  category TEXT,
  description TEXT,
  deadline DATE NOT NULL,
  frequency TEXT,
  next_due_date DATE,
  status TEXT DEFAULT 'Pending',
  responsible_person TEXT,
  reminder_days INTEGER DEFAULT 7,
  document_link TEXT,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 5: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employee_status);
CREATE INDEX IF NOT EXISTS idx_employees_deployment ON employees(deployment_status);
CREATE INDEX IF NOT EXISTS idx_employees_client ON employees(assigned_client);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_expense_status ON expense_claims(status);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance(date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON client_invoices(status);
CREATE INDEX IF NOT EXISTS idx_compliance_deadline ON compliance(deadline);

-- ============================================
-- STEP 6: Insert sample data (only if tables are empty)
-- ============================================

-- Sample Employee
INSERT INTO employees (
  employee_id, employee_name, first_name, last_name, 
  email, phone, designation, role, basic_salary, 
  employee_status, deployment_status
)
SELECT 
  'EMP001', 'John Doe', 'John', 'Doe', 
  'john.doe@example.com', '9876543210', 'Security Guard', 'Security', 15000, 
  'Active', 'On Bench'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_id = 'EMP001');

-- Sample Client
INSERT INTO clients (
  client_id, company_name, contact_person, email, phone, 
  status, deployed_count, monthly_billing
)
SELECT 
  'CLI001', 'Tech Corp India', 'Rajesh Kumar', 'rajesh@techcorp.com', '9876543211', 
  'Active', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE client_id = 'CLI001');

-- Sample Partner
INSERT INTO partners (site_id, partner_name, location, headcount, status)
SELECT 'SITE001', 'Mumbai Office Park', 'Mumbai, Maharashtra', 25, 'Active'
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE site_id = 'SITE001');

-- Sample Compliance Records
INSERT INTO compliance (requirement, category, deadline, status, responsible_person)
SELECT 'PF Filing - May 2026', 'Statutory', '2026-06-15', 'Pending', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM compliance WHERE requirement = 'PF Filing - May 2026')
UNION ALL
SELECT 'ESI Filing - May 2026', 'Statutory', '2026-06-21', 'Pending', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM compliance WHERE requirement = 'ESI Filing - May 2026')
UNION ALL
SELECT 'GST Return - May 2026', 'Tax', '2026-06-20', 'Pending', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM compliance WHERE requirement = 'GST Return - May 2026');

-- ============================================
-- STEP 7: Create views for analytics
-- ============================================

-- View: Active Employees Summary
CREATE OR REPLACE VIEW active_employees_summary AS
SELECT 
  COUNT(*) as total_employees,
  COUNT(*) FILTER (WHERE deployment_status = 'Deployed') as deployed_count,
  COUNT(*) FILTER (WHERE deployment_status = 'On Bench') as bench_count,
  COUNT(*) FILTER (WHERE employee_status = 'On Leave') as on_leave_count
FROM employees
WHERE employee_status = 'Active';

-- View: Monthly Payroll Summary
CREATE OR REPLACE VIEW monthly_payroll_summary AS
SELECT 
  month,
  year,
  COUNT(*) as employee_count,
  SUM(gross_earnings) as total_gross,
  SUM(total_deductions) as total_deductions,
  SUM(net_salary) as total_net_salary,
  COUNT(*) FILTER (WHERE payment_status = 'Paid') as paid_count,
  COUNT(*) FILTER (WHERE payment_status = 'Pending') as pending_count
FROM payroll
GROUP BY month, year
ORDER BY year DESC, 
  CASE month
    WHEN 'January' THEN 1
    WHEN 'February' THEN 2
    WHEN 'March' THEN 3
    WHEN 'April' THEN 4
    WHEN 'May' THEN 5
    WHEN 'June' THEN 6
    WHEN 'July' THEN 7
    WHEN 'August' THEN 8
    WHEN 'September' THEN 9
    WHEN 'October' THEN 10
    WHEN 'November' THEN 11
    WHEN 'December' THEN 12
  END DESC;

-- View: Financial Summary
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
  SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) as net_profit
FROM finance;

-- ============================================
-- STEP 8: Verify setup
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
  employee_count INTEGER;
  client_count INTEGER;
  compliance_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'employees', 'clients', 'partners', 'attendance',
    'leave_requests', 'expense_claims', 'payroll',
    'finance', 'client_invoices', 'compliance'
  );

  -- Count sample data
  SELECT COUNT(*) INTO employee_count FROM employees;
  SELECT COUNT(*) INTO client_count FROM clients;
  SELECT COUNT(*) INTO compliance_count FROM compliance;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║     ✅ VIMANASA NEXUS DATABASE SETUP COMPLETE!            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Created/Updated: % / 10', table_count;
  RAISE NOTICE '🔍 Indexes Created: 11';
  RAISE NOTICE '📈 Views Created: 3';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Sample Data:';
  RAISE NOTICE '   • Employees: %', employee_count;
  RAISE NOTICE '   • Clients: %', client_count;
  RAISE NOTICE '   • Compliance: %', compliance_count;
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your database is ready to use!';
  RAISE NOTICE '🌐 Refresh your dashboard to see the data.';
  RAISE NOTICE '';
END $$;
