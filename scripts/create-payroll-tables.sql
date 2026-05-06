-- Automated Payroll System Database Schema
-- Run this in Supabase SQL Editor to create all necessary tables
-- Note: This script only creates NEW payroll tables, not the existing employees table

-- 1. Enhanced Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  designation TEXT,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Attendance
  total_working_days INTEGER DEFAULT 26,
  present_days INTEGER DEFAULT 0,
  paid_leave_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  attendance_percentage DECIMAL(5,2),
  
  -- Earnings
  basic_salary DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  conveyance DECIMAL(10,2) DEFAULT 0,
  medical DECIMAL(10,2) DEFAULT 0,
  special_allowance DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  overtime DECIMAL(10,2) DEFAULT 0,
  incentives DECIMAL(10,2) DEFAULT 0,
  other_allowances DECIMAL(10,2) DEFAULT 0,
  gross_earnings DECIMAL(10,2) DEFAULT 0,
  
  -- Deductions
  pf DECIMAL(10,2) DEFAULT 0,
  esi DECIMAL(10,2) DEFAULT 0,
  professional_tax DECIMAL(10,2) DEFAULT 0,
  tds DECIMAL(10,2) DEFAULT 0,
  loan_recovery DECIMAL(10,2) DEFAULT 0,
  advance_recovery DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  
  -- Net Salary
  net_salary DECIMAL(10,2) DEFAULT 0,
  
  -- Payment Details
  payment_date DATE,
  payment_mode TEXT DEFAULT 'Bank Transfer',
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, processing, paid, failed
  
  -- Bank Details
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  
  -- Metadata
  processed_by TEXT,
  processed_at TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Salary Advances Table
CREATE TABLE IF NOT EXISTS salary_advances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  
  -- Advance Details
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  request_date DATE NOT NULL,
  
  -- Recovery Details
  recovery_months INTEGER DEFAULT 1,
  recovery_amount DECIMAL(10,2) NOT NULL,
  remaining_amount DECIMAL(10,2) NOT NULL,
  recovered BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, recovered
  
  -- Approval
  approved_by TEXT,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Employee Loans Table
CREATE TABLE IF NOT EXISTS employee_loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  
  -- Loan Details
  loan_type TEXT NOT NULL, -- Personal, Emergency, Education, Medical, Housing
  principal DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  emi DECIMAL(10,2) NOT NULL,
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Progress
  paid_installments INTEGER DEFAULT 0,
  total_installments INTEGER NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  
  -- Purpose
  purpose TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, completed, closed, defaulted
  
  -- Schedule (JSON)
  schedule JSONB,
  
  -- Approval
  approved_by TEXT,
  approved_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Payroll History/Audit Table
CREATE TABLE IF NOT EXISTS payroll_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_id UUID REFERENCES payroll(id),
  action TEXT NOT NULL, -- created, updated, processed, paid
  changed_by TEXT,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tax Declarations Table (for TDS calculation)
CREATE TABLE IF NOT EXISTS tax_declarations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  financial_year TEXT NOT NULL,
  
  -- Deductions
  section_80c DECIMAL(10,2) DEFAULT 0,
  section_80d DECIMAL(10,2) DEFAULT 0,
  hra_exemption DECIMAL(10,2) DEFAULT 0,
  home_loan_interest DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  
  -- Regime
  tax_regime TEXT DEFAULT 'new', -- old, new
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, submitted, approved
  submitted_at TIMESTAMP,
  approved_by TEXT,
  approved_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, financial_year)
);

-- 6. Bank Transfer Batch Table
CREATE TABLE IF NOT EXISTS bank_transfer_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_number TEXT UNIQUE NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Summary
  total_employees INTEGER DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  
  -- File Details
  file_name TEXT,
  file_format TEXT DEFAULT 'NEFT', -- NEFT, RTGS, IMPS
  file_generated_at TIMESTAMP,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, generated, uploaded, processed, completed
  
  -- Processing
  uploaded_by TEXT,
  uploaded_at TIMESTAMP,
  processed_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll(payment_status);

CREATE INDEX IF NOT EXISTS idx_advances_employee ON salary_advances(employee_id);
CREATE INDEX IF NOT EXISTS idx_advances_status ON salary_advances(status);

CREATE INDEX IF NOT EXISTS idx_loans_employee ON employee_loans(employee_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON employee_loans(status);

CREATE INDEX IF NOT EXISTS idx_tax_declarations_employee ON tax_declarations(employee_id);
CREATE INDEX IF NOT EXISTS idx_tax_declarations_fy ON tax_declarations(financial_year);

-- Create Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advances_updated_at BEFORE UPDATE ON salary_advances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON employee_loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_declarations_updated_at BEFORE UPDATE ON tax_declarations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transfer_batches ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all for service role, customize as needed)
CREATE POLICY "Enable all for service role" ON payroll FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON salary_advances FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON employee_loans FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON payroll_history FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON tax_declarations FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON bank_transfer_batches FOR ALL USING (true);

-- Insert Sample Data (Optional - for testing)
-- Uncomment to add sample data

/*
INSERT INTO payroll (
  employee_id, employee_name, designation, month, year,
  basic_salary, hra, conveyance, medical, special_allowance,
  gross_earnings, pf, esi, professional_tax, tds,
  total_deductions, net_salary, payment_status
) VALUES (
  'EMP001', 'John Doe', 'Security Guard', 'January', 2026,
  15000, 7500, 1600, 1250, 5000,
  30350, 1800, 0, 200, 0,
  2000, 28350, 'pending'
);
*/

-- Success Message
DO $$
BEGIN
  RAISE NOTICE 'Payroll system tables created successfully!';
  RAISE NOTICE 'Tables created: payroll, salary_advances, employee_loans, payroll_history, tax_declarations, bank_transfer_batches';
  RAISE NOTICE 'Indexes and triggers configured.';
  RAISE NOTICE 'Row Level Security enabled.';
END $$;
