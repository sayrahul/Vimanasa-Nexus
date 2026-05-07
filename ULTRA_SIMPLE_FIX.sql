-- ============================================
-- ULTRA SIMPLE FIX - One Command at a Time
-- ============================================

-- Fix 1: Add employee_status column
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_status TEXT DEFAULT 'Active';

-- Fix 2: Add deployment_status column
ALTER TABLE employees ADD COLUMN IF NOT EXISTS deployment_status TEXT DEFAULT 'On Bench';

-- Fix 3: Add assigned_client column
ALTER TABLE employees ADD COLUMN IF NOT EXISTS assigned_client TEXT;

-- Fix 4: Add a sample employee if table is empty
INSERT INTO employees (employee_id, employee_name, designation, basic_salary, employee_status, deployment_status)
SELECT 'EMP001', 'John Doe', 'Security Guard', 15000, 'Active', 'On Bench'
WHERE NOT EXISTS (SELECT 1 FROM employees LIMIT 1);

-- Done! Refresh your dashboard now.
