-- ============================================
-- STEP 1: Check what columns you actually have
-- ============================================
-- Run this FIRST to see your table structure

SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;
