-- ============================================
-- CHECK YOUR CURRENT DATABASE STRUCTURE
-- ============================================
-- Run this FIRST to see what you have

-- Check what tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check employees table columns (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- Check how many records in each table
DO $$
DECLARE
  rec RECORD;
  row_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 TABLE RECORD COUNTS:';
  RAISE NOTICE '========================';
  
  FOR rec IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', rec.table_name) INTO row_count;
    RAISE NOTICE '% : % records', RPAD(rec.table_name, 20), row_count;
  END LOOP;
  
  RAISE NOTICE '';
END $$;
