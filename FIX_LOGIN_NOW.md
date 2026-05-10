# 🚨 FIX LOGIN ERROR - 2 Minute Solution

**Error:** "Invalid username or password"  
**Cause:** Database tables not created yet  
**Solution:** Run one SQL script  

---

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk/sql
2. Click **"New Query"**

### Step 2: Run the Quick Fix Script

1. Open file: `scripts/QUICK_FIX_AUTH.sql`
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Login

Go to: http://localhost:3000

**Credentials:**
- Username: `admin`
- Password: `Vimanasa@2026`

---

## ✅ That's It!

You should now be able to login successfully!

---

## 🔐 What This Script Does

1. ✅ Creates `users` table
2. ✅ Creates `user_permissions` table
3. ✅ Creates `audit_logs` table
4. ✅ Adds admin user with password: `Vimanasa@2026`
5. ✅ Grants admin permissions

---

## ⚠️ Important Notes

### Temporary Password

The password `Vimanasa@2026` is **temporary** and uses a pre-generated hash for quick setup.

**For production or better security:**
1. Generate a secure password: `node scripts/generate-password-hash.js`
2. Update the user in Supabase with the new hash
3. Or use the full setup guide: `SECURITY_SETUP_QUICKSTART.md`

### Why This Happened

The authentication system was updated to use database-backed users instead of hardcoded credentials. This is much more secure, but requires the database tables to be set up first.

---

## 🆘 Troubleshooting

### Still getting "Invalid username or password"?

1. **Check tables were created:**
   - Go to Supabase → Table Editor
   - Look for `users`, `user_permissions`, `audit_logs` tables

2. **Check admin user exists:**
   - Open `users` table in Supabase
   - Look for username: `admin`

3. **Restart dev server:**
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

4. **Clear browser cache:**
   - Press Ctrl+Shift+R to hard refresh

### Error: "relation users does not exist"

→ The SQL script didn't run successfully. Try running it again in Supabase SQL Editor.

### Error: "JWT_SECRET is not configured"

→ Check `.env.local` has `JWT_SECRET=...` (it should already be set)

---

## 📚 Next Steps (Optional)

After you can login successfully:

### For Better Security (Recommended)

1. **Generate a secure password:**
   ```bash
   node scripts/generate-password-hash.js
   ```

2. **Update admin user in Supabase:**
   ```sql
   UPDATE users 
   SET password_hash = 'YOUR_GENERATED_HASH_HERE'
   WHERE username = 'admin';
   ```

3. **Login with new password**

### For Complete Setup

Follow the comprehensive guide:
- `SECURITY_SETUP_QUICKSTART.md` - Full setup with custom passwords
- `SECURITY_FIXES_IMPLEMENTED.md` - Complete documentation

---

## 🎯 Summary

**Problem:** Login not working because database tables don't exist  
**Solution:** Run `scripts/QUICK_FIX_AUTH.sql` in Supabase  
**Time:** 2 minutes  
**Result:** Can login with admin/Vimanasa@2026  

---

**Need help?** Check the troubleshooting section above or see `SECURITY_SETUP_QUICKSTART.md`
