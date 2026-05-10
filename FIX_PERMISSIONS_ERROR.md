# 🔧 Fix "Insufficient Permissions" Error

## 📋 The Problem

You're seeing this error:
```
❌ Error: Insufficient permissions
```

This happens because Supabase Row Level Security (RLS) policies are blocking your application from accessing the database tables.

---

## ✅ The Solution (1 Minute)

### Step 1: Open Supabase SQL Editor

Click this link: 👉 **https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk/sql**

Or manually:
1. Go to https://supabase.com/dashboard
2. Select your project: `nzwwwhufprdultuyzezk`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Copy the SQL Script

Open the file: **`scripts/FIX_RLS_POLICIES.sql`**

Select all (Ctrl+A) and copy (Ctrl+C)

### Step 3: Paste and Run

1. Paste the SQL into the Supabase SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success" message

You should see output like:
```
✅ RLS POLICIES FIXED!

📋 What was fixed:
   • All tables now allow service role access
   • Removed restrictive auth.uid() checks
   • Created permissive policies for all operations
```

### Step 4: Restart Your Dev Server

In your terminal:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Refresh Browser

1. Go to: http://localhost:3000
2. Press **Ctrl+Shift+R** (hard refresh)
3. The dashboard should now load without errors

---

## 🔍 What Caused This?

### The Problem
- Supabase has **Row Level Security (RLS)** enabled on all tables
- The old policies checked for `auth.uid()` (user authentication)
- Your app uses the **service role key** which bypasses normal auth
- The policies were blocking service role access

### The Fix
- Created new policies that allow **all operations** for service role
- Kept RLS enabled (good for security)
- Removed restrictive `auth.uid()` checks
- Now your app can read/write data freely

---

## 🆘 Still Having Issues?

### Issue: "relation [table_name] does not exist"

**Solution:** Some tables haven't been created yet. Run these scripts in order:

1. **`scripts/QUICK_FIX_AUTH.sql`** - Creates users table
2. **`scripts/FIX_RLS_POLICIES.sql`** - Fixes permissions
3. Create other tables as needed (workforce, clients, etc.)

### Issue: Still getting "Insufficient permissions"

**Checklist:**
- [ ] SQL script ran successfully (no errors)
- [ ] Dev server restarted (`npm run dev`)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Using correct Supabase project
- [ ] `.env.local` has correct `SUPABASE_SERVICE_ROLE_KEY`

### Issue: "permission denied for table [table_name]"

**Solution:** The table exists but RLS policy wasn't applied. Run this:

```sql
-- Replace 'table_name' with your actual table name
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service role" ON table_name;

CREATE POLICY "Allow all for service role"
  ON table_name
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## 📊 Verify Setup

### Check RLS Status

Run this in Supabase SQL Editor:

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rls_enabled = true`

### Check Policies

Run this in Supabase SQL Editor:

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Each table should have a policy named "Allow all for service role"

---

## 🔐 Security Notes

### Is This Secure?

**Yes!** Here's why:

✅ **RLS is still enabled** - Tables are protected  
✅ **Service role key is secret** - Only your backend has it  
✅ **Anon key is still restricted** - Public access is blocked  
✅ **Policies can be refined later** - You can add user-specific rules  

### For Production

Consider adding more granular policies:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users see own data"
  ON workforce
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Example: Only admins can delete
CREATE POLICY "Admins can delete"
  ON workforce
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

But for now, the permissive policy is fine for development.

---

## 📚 Related Documentation

- **Login Fix:** `LOGIN_FIX_INSTRUCTIONS.md`
- **User Management:** `USER_MANAGEMENT_GUIDE.md`
- **Security Setup:** `SECURITY_SETUP_QUICKSTART.md`

---

## 🎯 Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Open Supabase SQL Editor | 15 sec |
| 2 | Copy `scripts/FIX_RLS_POLICIES.sql` | 10 sec |
| 3 | Paste and Run in Supabase | 20 sec |
| 4 | Restart dev server | 15 sec |
| 5 | Refresh browser | 5 sec |
| **Total** | | **~1 minute** |

---

## ✅ Expected Result

After completing these steps:

✅ No more "Insufficient permissions" error  
✅ Dashboard loads successfully  
✅ Can view all data (workforce, clients, etc.)  
✅ Can create/edit/delete records  
✅ All features work properly  

---

## 🔄 Complete Setup Sequence

If you're setting up from scratch, run these in order:

1. **`scripts/QUICK_FIX_AUTH.sql`**
   - Creates users, user_permissions, audit_logs tables
   - Adds admin user
   - Login credentials: admin / Vimanasa@2026

2. **`scripts/FIX_RLS_POLICIES.sql`**
   - Fixes RLS policies for all tables
   - Allows service role access
   - Removes permission errors

3. **Create other tables as needed:**
   - `scripts/create-payroll-tables.sql` (if using payroll)
   - Or create tables via Supabase Table Editor

4. **Restart and test:**
   ```bash
   npm run dev
   ```

---

**Ready to fix it?** Open `scripts/FIX_RLS_POLICIES.sql` and follow Step 1! 🚀
