-- ============================================
-- SIMPLE FIX - Just Add Missing Columns
-- ============================================
-- Run this in Supabase SQL Editor

-- Step 1: Add missing columns to employees table (if it exists)
DO $$
BEGIN
  -- Add employee_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'employee_status'
  ) THEN
    ALTER TABLE employees ADD COLUMN employee_status TEXT DEFAULT 'Active';
  END IF;

  -- Add deployment_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'deployment_status'
  ) THEN
    ALTER TABLE employees ADD COLUMN deployment_status TEXT DEFAULT 'On Bench';
  END IF;

  -- Add assigned_client
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'assigned_client'
  ) THEN
    ALTER TABLE employees ADD COLUMN assigned_client TEXT;
  END IF;

  RAISE NOTICE '✅ Added missing columns to employees table';

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE '⚠️ employees table does not exist';
END $$;

-- Step 2: Add sample employee if table is empty
INSERT INTO employees (
  employee_id, employee_name, designation, basic_salary, 
  employee_status, deployment_status
)
SELECT 
  'EMP001', 'John Doe', 'Security Guard', 15000, 
  'Active', 'On Bench'
WHERE NOT EXISTS (SELECT 1 FROM employees LIMIT 1);

-- Step 3: Show success message
DO $$
DECLARE
  emp_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO emp_count FROM employees;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ FIX COMPLETE!';
  RAISE NOTICE '📊 Employees in database: %', emp_count;
  RAISE NOTICE '🌐 Refresh your dashboard now!';
  RAISE NOTICE '';
END $$;
