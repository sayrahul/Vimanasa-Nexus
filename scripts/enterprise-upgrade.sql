-- 1. True Database Metadata JSON Columns
-- Adds a generic 'metadata' JSONB column to allow infinite frontend flexibility
-- without needing to alter the schema for new form fields.

ALTER TABLE employees ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE finance ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE compliance ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE expense_claims ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ensure client_invoices table exists
CREATE TABLE IF NOT EXISTS client_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT,
    month TEXT NOT NULL,
    due_date TEXT,
    invoice_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Supabase Realtime WebSockets
-- Enables the Supabase Realtime API to broadcast changes for all these tables
-- to connected Next.js clients instantly.

-- Note: The supabase_realtime publication usually exists by default, 
-- but if it doesn't, this creates it.
-- Then we add the tables to it.
BEGIN;
  DO $$ 
  BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;
  
  DO $$
  DECLARE
      t_name text;
  BEGIN
      FOR t_name IN SELECT unnest(ARRAY['employees', 'clients', 'partners', 'payroll', 'finance', 'compliance', 'attendance', 'leave_requests', 'expense_claims', 'client_invoices'])
      LOOP
          IF NOT EXISTS (
              SELECT 1
              FROM pg_publication_tables
              WHERE pubname = 'supabase_realtime' AND tablename = t_name
          ) THEN
              EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t_name);
          END IF;
      END LOOP;
  END;
  $$;
COMMIT;
