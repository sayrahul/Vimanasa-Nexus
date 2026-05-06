# 🗄️ Payroll Database Setup - Simple Guide

## ⚠️ You Got This Error?

```
Error: Failed to run sql query: ERROR: 42P07: relation "employees" already exists
```

**Don't worry!** This just means your database already has some tables. We'll only create the NEW payroll tables.

---

## ✅ SOLUTION: Use the Fixed SQL Script

### Option 1: Manual Setup (RECOMMENDED - 2 minutes)

1. **Open the Fixed SQL File**
   - File: `scripts/create-payroll-tables-FIXED.sql`
   - This file is safe - it won't touch your existing tables

2. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in the left sidebar

3. **Copy & Paste**
   - Open `scripts/create-payroll-tables-FIXED.sql`
   - Select ALL content (Ctrl+A)
   - Copy (Ctrl+C)
   - Paste in Supabase SQL Editor (Ctrl+V)

4. **Run the Script**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait 5-10 seconds
   - You should see success messages

5. **Verify Success**
   - Look for the success message in the output
   - Should say "✅ PAYROLL SYSTEM SETUP COMPLETE!"
   - Should show "Tables Created: 6 / 6"

---

### Option 2: Automated Setup (1 minute)

Run this command in your terminal:

```bash
node setup-payroll-database.js
```

This will automatically create all tables for you!

---

## 📊 What Gets Created?

The script creates **6 NEW tables** (won't touch existing ones):

1. ✅ `payroll` - Main payroll records
2. ✅ `salary_advances` - Salary advance tracking
3. ✅ `employee_loans` - Employee loan management
4. ✅ `payroll_history` - Audit trail
5. ✅ `tax_declarations` - Tax planning
6. ✅ `bank_transfer_batches` - Bank file generation

---

## 🔍 How to Verify Tables Were Created

Run this query in Supabase SQL Editor:

```sql
SELECT table_name 
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
```

**Expected Result**: Should return 6 rows (one for each table)

---

## ❓ Troubleshooting

### Problem: "relation already exists" error

**Solution**: The fixed script handles this! It uses `IF NOT EXISTS` so it won't fail if tables already exist.

### Problem: "permission denied" error

**Solution**: Make sure you're using the service role key, not the anon key.

### Problem: Script runs but no tables created

**Solution**: 
1. Check your Supabase connection
2. Verify you have admin access
3. Try running individual CREATE TABLE statements

---

## 🎯 Quick Test After Setup

Run this query to test:

```sql
-- Test insert into payroll table
INSERT INTO payroll (
  employee_id,
  employee_name,
  month,
  year,
  basic_salary,
  gross_earnings,
  net_salary
) VALUES (
  'TEST001',
  'Test Employee',
  'January',
  2026,
  15000,
  30000,
  28000
);

-- Verify it worked
SELECT * FROM payroll WHERE employee_id = 'TEST001';

-- Clean up test data
DELETE FROM payroll WHERE employee_id = 'TEST001';
```

If this works, you're all set! ✅

---

## 📝 Next Steps After Database Setup

1. ✅ Database setup complete
2. ⏭️ Import components in your app
3. ⏭️ Test with sample data
4. ⏭️ Process first payroll

See `PAYROLL_INTEGRATION_GUIDE.md` for next steps!

---

## 🆘 Still Having Issues?

### Manual Table Creation

If automated setup doesn't work, create tables one by one:

```sql
-- 1. Create payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10,2) DEFAULT 0,
  gross_earnings DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create salary_advances table
CREATE TABLE IF NOT EXISTS salary_advances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create employee_loans table
CREATE TABLE IF NOT EXISTS employee_loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  principal DECIMAL(10,2) NOT NULL,
  emi DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Continue with other tables from the fixed SQL file...
```

---

## ✅ Success Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied fixed SQL script
- [ ] Pasted in SQL Editor
- [ ] Clicked "Run"
- [ ] Saw success message
- [ ] Verified 6 tables created
- [ ] Tested with sample insert
- [ ] Ready to integrate components!

---

**You're almost there! Just run the fixed SQL script and you'll be ready to go! 🚀**
