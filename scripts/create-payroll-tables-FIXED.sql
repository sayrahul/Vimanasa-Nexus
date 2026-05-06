-- ============================================================================
-- AUTOMATED PAYROLL SYSTEM - DATABASE SETUP (FIXED VERSION)
-- ============================================================================
-- This script creates ONLY the new payroll-related tables
-- It will NOT touch your existing employees, clients, or other tables
-- Safe to run - uses IF NOT EXISTS to prevent conflicts
-- ============================================================================

-- 1. PAYROLL TABLE - Main payroll records
-- ============================================================================
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
  payment_status TEXT DEFAULT 'pending',
  
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

-- 2. SALARY ADVANCES TABLE
-- ============================================================================
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
  status TEXT DEFAULT 'pending',
  
  -- Approval
  approved_by TEXT,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. EMPLOYEE LOANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  
  -- Loan Details
  loan_type TEXT NOT NULL,
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
  status TEXT DEFAULT 'active',
  
  -- Schedule (JSON)
  schedule JSONB,
  
  -- Approval
  approved_by TEXT,
  approved_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. PAYROLL HISTORY/AUDIT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_id UUID REFERENCES payroll(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changed_by TEXT,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. TAX DECLARATIONS TABLE
-- ============================================================================
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
  tax_regime TEXT DEFAULT 'new',
  
  -- Status
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMP,
  approved_by TEXT,
  approved_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, financial_year)
);

-- 6. BANK TRANSFER BATCH TABLE
-- ============================================================================
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
  file_format TEXT DEFAULT 'NEFT',
  file_generated_at TIMESTAMP,
  
  -- Status
  status TEXT DEFAULT 'pending',
  
  -- Processing
  uploaded_by TEXT,
  uploaded_at TIMESTAMP,
  processed_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Drop existing indexes if they exist (to avoid conflicts)
DROP INDEX IF EXISTS idx_payroll_employee;
DROP INDEX IF EXISTS idx_payroll_month_year;
DROP INDEX IF EXISTS idx_payroll_status;
DROP INDEX IF EXISTS idx_advances_employee;
DROP INDEX IF EXISTS idx_advances_status;
DROP INDEX IF EXISTS idx_loans_employee;
DROP INDEX IF EXISTS idx_loans_status;
DROP INDEX IF EXISTS idx_tax_declarations_employee;
DROP INDEX IF EXISTS idx_tax_declarations_fy;

-- Create new indexes
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);
CREATE INDEX idx_payroll_status ON payroll(payment_status);

CREATE INDEX idx_advances_employee ON salary_advances(employee_id);
CREATE INDEX idx_advances_status ON salary_advances(status);

CREATE INDEX idx_loans_employee ON employee_loans(employee_id);
CREATE INDEX idx_loans_status ON employee_loans(status);

CREATE INDEX idx_tax_declarations_employee ON tax_declarations(employee_id);
CREATE INDEX idx_tax_declarations_fy ON tax_declarations(financial_year);

-- ============================================================================
-- CREATE UPDATED_AT TRIGGERS
-- ============================================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_payroll_updated_at ON payroll;
DROP TRIGGER IF EXISTS update_advances_updated_at ON salary_advances;
DROP TRIGGER IF EXISTS update_loans_updated_at ON employee_loans;
DROP TRIGGER IF EXISTS update_tax_declarations_updated_at ON tax_declarations;

-- Create triggers
CREATE TRIGGER update_payroll_updated_at 
  BEFORE UPDATE ON payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advances_updated_at 
  BEFORE UPDATE ON salary_advances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at 
  BEFORE UPDATE ON employee_loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_declarations_updated_at 
  BEFORE UPDATE ON tax_declarations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transfer_batches ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE POLICIES (Allow all for service role)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all for service role" ON payroll;
DROP POLICY IF EXISTS "Enable all for service role" ON salary_advances;
DROP POLICY IF EXISTS "Enable all for service role" ON employee_loans;
DROP POLICY IF EXISTS "Enable all for service role" ON payroll_history;
DROP POLICY IF EXISTS "Enable all for service role" ON tax_declarations;
DROP POLICY IF EXISTS "Enable all for service role" ON bank_transfer_batches;

-- Create new policies
CREATE POLICY "Enable all for service role" ON payroll FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON salary_advances FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON employee_loans FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON payroll_history FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON tax_declarations FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON bank_transfer_batches FOR ALL USING (true);

-- ============================================================================
-- VERIFICATION & SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  -- Count the tables we just created
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'payroll',
    'salary_advances',
    'employee_loans',
    'payroll_history',
    'tax_declarations',
    'bank_transfer_batches'
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                              ║';
  RAISE NOTICE '║          ✅ PAYROLL SYSTEM SETUP COMPLETE! ✅                ║';
  RAISE NOTICE '║                                                              ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Created: % / 6', table_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables:';
  RAISE NOTICE '   1. payroll                  - Main payroll records';
  RAISE NOTICE '   2. salary_advances          - Advance tracking';
  RAISE NOTICE '   3. employee_loans           - Loan management';
  RAISE NOTICE '   4. payroll_history          - Audit trail';
  RAISE NOTICE '   5. tax_declarations         - Tax planning';
  RAISE NOTICE '   6. bank_transfer_batches    - Bank integration';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Indexes: Created for performance';
  RAISE NOTICE '✅ Triggers: Auto-update timestamps configured';
  RAISE NOTICE '✅ RLS: Row Level Security enabled';
  RAISE NOTICE '✅ Policies: Access policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your payroll system is ready to use!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '   1. Import components in your app';
  RAISE NOTICE '   2. Test with sample data';
  RAISE NOTICE '   3. Process your first payroll';
  RAISE NOTICE '';
  RAISE NOTICE '📚 Documentation: See AUTOMATED_PAYROLL_SYSTEM.md';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
