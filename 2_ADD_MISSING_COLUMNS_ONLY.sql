-- ============================================
-- STEP 2: Add ONLY the missing columns
-- ============================================
-- This adds columns that your dashboard needs
-- Run this AFTER checking your columns

-- Add employee_status (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'employee_status'
  ) THEN
    ALTER TABLE employees ADD COLUMN employee_status TEXT DEFAULT 'Active';
    RAISE NOTICE '✅ Added employee_status column';
  ELSE
    RAISE NOTICE '✓ employee_status already exists';
  END IF;
END $$;

-- Add deployment_status (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'deployment_status'
  ) THEN
    ALTER TABLE employees ADD COLUMN deployment_status TEXT DEFAULT 'On Bench';
    RAISE NOTICE '✅ Added deployment_status column';
  ELSE
    RAISE NOTICE '✓ deployment_status already exists';
  END IF;
END $$;

-- Add assigned_client (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'assigned_client'
  ) THEN
    ALTER TABLE employees ADD COLUMN assigned_client TEXT;
    RAISE NOTICE '✅ Added assigned_client column';
  ELSE
    RAISE NOTICE '✓ assigned_client already exists';
  END IF;
END $$;

-- Show success
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ COLUMNS ADDED SUCCESSFULLY!';
  RAISE NOTICE '🌐 Now refresh your dashboard (Ctrl+Shift+R)';
  RAISE NOTICE '';
END $$;
