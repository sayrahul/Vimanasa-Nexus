# 🔧 Fix "Invalid username or password" Error

## 📋 The Problem

You're seeing this error because the authentication system now uses a **database** instead of hardcoded credentials. The database tables haven't been created yet.

```
❌ Error: Invalid username or password
```

---

## ✅ The Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor

Click this link: 👉 https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk/sql

Or manually:
1. Go to https://supabase.com/dashboard
2. Select your project: `nzwwwhufprdultuyzezk`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Copy the SQL Script

Open the file: **`scripts/QUICK_FIX_AUTH.sql`**

Select all (Ctrl+A) and copy (Ctrl+C)

### Step 3: Paste and Run

1. Paste the SQL into the Supabase SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success" message

You should see output like:
```
✅ Setup Complete!

📝 Login Credentials:
   Username: admin
   Password: (the password from the SQL script - default is the same as before)
```

### Step 4: Restart Your Dev Server

In your terminal:
1. Press **Ctrl+C** to stop the server
2. Run: `npm run dev`
3. Wait for "Ready" message

### Step 5: Login

1. Open: http://localhost:3000
2. Enter:
   - **Username:** `admin`
   - **Password:** (use the password from the SQL script)
3. Click **"Login"**

---

## 🎉 Success!

You should now be logged in and see the dashboard!

---

## 🔍 What the Script Does

The SQL script creates three tables:

1. **`users`** - Stores user accounts with secure password hashes
2. **`user_permissions`** - Stores user permissions
3. **`audit_logs`** - Logs all authentication attempts

And adds one admin user:
- Username: `admin`
- Password: (securely hashed - use the password from the SQL script)
- Role: `super_admin` (full access)

---

## 🔐 Security Note

The password is stored as a secure PBKDF2-SHA256 hash (not plaintext) in the database. The SQL script contains the pre-computed hash for convenience during setup.
- ✅ Protected with account lockout (5 failed attempts)
- ✅ Logged in audit trail

**For production:** Generate a new secure password using:
```bash
node scripts/generate-password-hash.js
```

---

## 🆘 Still Having Issues?

### Issue: "relation users does not exist"

**Solution:** The SQL script didn't run. Try again:
1. Make sure you copied the **entire** SQL script
2. Make sure you're in the correct Supabase project
3. Click "Run" again

### Issue: "duplicate key value violates unique constraint"

**Solution:** Admin user already exists. Update instead:
```sql
UPDATE users 
SET password_hash = '100000$+QkqKgqlQcfTSvBr5DgYww==$XnOd/LQ74kJEdI4ajBkOt3ThdM0ThWCtuAPaywYcK6g=',
    is_locked = false,
    failed_login_attempts = 0
WHERE username = 'admin';
```

### Issue: Still can't login after running SQL

**Checklist:**
- [ ] SQL script ran successfully (no errors)
- [ ] Dev server restarted (`npm run dev`)
- [ ] Using correct credentials (check the SQL script for the password)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Check Supabase Table Editor → users table has admin user

### Issue: "JWT_SECRET is not configured"

**Solution:** Check `.env.local` file has:
```
JWT_SECRET=LN2T3bLnye60kwsGLIANS8euX8Q+LErtB4evrkg4TKU=
```

If missing, add it and restart the server.

---

## 📊 Verify Setup

### Check Tables in Supabase

1. Go to: https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk/editor
2. You should see these tables:
   - ✅ `users`
   - ✅ `user_permissions`
   - ✅ `audit_logs`

### Check Admin User

1. Click on `users` table
2. You should see one row:
   - username: `admin`
   - email: `admin@vimanasa.com`
   - role: `super_admin`
   - is_active: `true`

### Check Permissions

1. Click on `user_permissions` table
2. You should see one row:
   - permission: `*` (all permissions)

---

## 📚 Next Steps

### After Successful Login

1. **Explore the Dashboard** - All features should work
2. **Check Audit Logs** - Your login should be logged
3. **Test Features** - Create/edit/delete data

### For Better Security (Optional)

1. **Generate a new password:**
   ```bash
   node scripts/generate-password-hash.js
   ```

2. **Update in Supabase:**
   ```sql
   UPDATE users 
   SET password_hash = 'YOUR_NEW_HASH_HERE'
   WHERE username = 'admin';
   ```

3. **Login with new password**

### For Complete Documentation

- **Quick Setup:** `SECURITY_SETUP_QUICKSTART.md`
- **Full Documentation:** `SECURITY_FIXES_IMPLEMENTED.md`
- **Implementation Summary:** `SECURITY_IMPLEMENTATION_SUMMARY.md`

---

## 🎯 Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Open Supabase SQL Editor | 30 sec |
| 2 | Copy `scripts/QUICK_FIX_AUTH.sql` | 10 sec |
| 3 | Paste and Run in Supabase | 30 sec |
| 4 | Restart dev server | 30 sec |
| 5 | Login with credentials from SQL | 20 sec |
| **Total** | | **~2 minutes** |

---

## ✅ Expected Result

After completing these steps:

✅ No more "Invalid username or password" error  
✅ Can login with admin credentials from SQL script  
✅ Dashboard loads successfully  
✅ All features work  
✅ Audit logs track your actions  

---

**Ready to fix it?** Open `scripts/QUICK_FIX_AUTH.sql` and follow Step 1! 🚀
