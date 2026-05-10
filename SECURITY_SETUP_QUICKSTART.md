# 🚀 Security Setup Quick Start Guide

**Time Required:** 15-20 minutes  
**Difficulty:** Easy  
**Prerequisites:** Access to Supabase dashboard and terminal  

---

## 📋 Overview

This guide will help you implement the security fixes in 8 simple steps:

1. ✅ Generate JWT Secret
2. ✅ Update Environment Variables
3. ✅ Create Database Tables
4. ✅ Generate Password Hashes
5. ✅ Seed Admin User
6. ✅ Test Authentication
7. ✅ Verify Security
8. ✅ Deploy to Production

---

## Step 1: Generate JWT Secret (2 minutes)

### Option A: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option B: Using OpenSSL
```bash
openssl rand -base64 32
```

### Option C: Using PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Copy the output** - you'll need it in the next step!

Example output:
```
Xk7mP9vQ2wR5tY8uI1oL3nM6bV4cZ0aS1dF2gH3jK4l=
```

---

## Step 2: Update Environment Variables (2 minutes)

### For Local Development

Open `.env.local` and add your JWT_SECRET:

```bash
# Add this line (replace with your generated secret)
JWT_SECRET=Xk7mP9vQ2wR5tY8uI1oL3nM6bV4cZ0aS1dF2gH3jK4l=

# These should already exist
NEXT_PUBLIC_SUPABASE_URL=https://nzwwwhufprdultuyzezk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### For Production (Vercel)

1. Go to: https://vercel.com/sayrahuls-projects/vimanasa-nexus/settings/environment-variables
2. Click "Add New"
3. Name: `JWT_SECRET`
4. Value: (paste your generated secret)
5. Environment: Production, Preview, Development
6. Click "Save"

⚠️ **IMPORTANT:** Use a **different** JWT_SECRET for production!

---

## Step 3: Create Database Tables (3 minutes)

### 3.1 Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**

### 3.2 Run Table Creation Script

1. Open file: `scripts/create-users-table.sql`
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)

### 3.3 Verify Success

You should see:
```
✅ Users table created successfully!
📝 Next steps:
   1. Run seed-admin-user.sql to create initial admin user
   2. Update JWT_SECRET in environment variables
   3. Deploy updated authentication code
```

### 3.4 Verify Tables Created

Click **"Table Editor"** in left sidebar. You should see:
- ✅ `users`
- ✅ `user_permissions`
- ✅ `audit_logs`
- ✅ `user_sessions`

---

## Step 4: Generate Password Hashes (3 minutes)

### 4.1 Run Password Generator

```bash
node scripts/generate-password-hash.js
```

### 4.2 Enter Your Passwords

When prompted, enter secure passwords for each user:

**Admin Password:**
```
Password: YourSecureAdminPassword123!
```

**Copy the generated hash** - it will look like:
```
100000$dGVtcHNhbHQxMjM0NTY3OA==$aGFzaGVkcGFzc3dvcmQxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=
```

**Repeat for HR Manager and Finance Manager** (optional)

⚠️ **IMPORTANT:** 
- Use strong passwords (min 12 characters)
- Mix uppercase, lowercase, numbers, symbols
- Don't use common passwords
- Store passwords securely (password manager)

---

## Step 5: Seed Admin User (3 minutes)

### 5.1 Update Seed Script

1. Open `scripts/seed-admin-user.sql`
2. Find the admin user INSERT statement
3. Replace the placeholder hash with your generated hash:

```sql
INSERT INTO users (
  id,
  username,
  email,
  password_hash,  -- Replace this value
  full_name,
  role,
  is_active,
  must_change_password,
  created_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'admin@vimanasa.com',
  '100000$YOUR_GENERATED_HASH_HERE$', -- ← Paste your hash here
  'System Administrator',
  'super_admin',
  true,
  false, -- Set to true to force password change on first login
  NOW()
);
```

### 5.2 Run Seed Script

1. Go back to Supabase SQL Editor
2. Click **"New Query"**
3. Copy **ALL** contents of `scripts/seed-admin-user.sql`
4. Paste into SQL Editor
5. Click **"Run"**

### 5.3 Verify Success

You should see a table showing created users:

| username | email | full_name | role | is_active |
|----------|-------|-----------|------|-----------|
| admin | admin@vimanasa.com | System Administrator | super_admin | true |

---

## Step 6: Test Authentication (3 minutes)

### 6.1 Start Development Server

```bash
npm run dev
```

Wait for:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

### 6.2 Test Login via Browser

1. Open: http://localhost:3000
2. Enter credentials:
   - **Username:** admin
   - **Password:** (your secure password from Step 4)
3. Click **"Login"**

### 6.3 Expected Result

✅ You should be logged in and see the dashboard!

### 6.4 Test Login via API (Optional)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourSecureAdminPassword123!"}'
```

Expected response:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "admin",
    "name": "System Administrator",
    "email": "admin@vimanasa.com",
    "role": "super_admin",
    "permissions": ["*"]
  },
  "token": "eyJhbGc..."
}
```

---

## Step 7: Verify Security (2 minutes)

### 7.1 Check Audit Logs

In Supabase:
1. Go to **Table Editor**
2. Open **audit_logs** table
3. You should see login attempts logged

### 7.2 Test Failed Login

Try logging in with wrong password:
- Username: admin
- Password: WrongPassword123

Expected: Login fails, audit log created

### 7.3 Test Account Lockout

Try logging in with wrong password **5 times**

Expected: Account locked, cannot login even with correct password

### 7.4 Unlock Account (if needed)

In Supabase SQL Editor:
```sql
UPDATE users 
SET is_locked = false, failed_login_attempts = 0 
WHERE username = 'admin';
```

---

## Step 8: Deploy to Production (5 minutes)

### 8.1 Verify Environment Variables

Check Vercel dashboard:
- ✅ JWT_SECRET (different from dev!)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### 8.2 Run Database Scripts in Production

1. Open **Production** Supabase project
2. Run `scripts/create-users-table.sql`
3. Generate **new** password hashes for production
4. Update `scripts/seed-admin-user.sql` with production hashes
5. Run seed script

### 8.3 Deploy Code

```bash
# Commit changes (without secrets!)
git add .
git commit -m "Implement security fixes - database-backed auth"
git push origin main
```

Vercel will automatically deploy.

### 8.4 Test Production

1. Go to: https://nexus.vimanasa.com
2. Login with production credentials
3. Verify dashboard loads
4. Check audit logs in production Supabase

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] JWT_SECRET set in `.env.local`
- [ ] JWT_SECRET set in Vercel (different from dev)
- [ ] Database tables created (users, user_permissions, audit_logs)
- [ ] Admin user created with secure password
- [ ] Can login successfully in development
- [ ] Audit logs are being created
- [ ] Failed login attempts are tracked
- [ ] Account lockout works after 5 failed attempts
- [ ] No hardcoded credentials in source code
- [ ] Production deployment successful
- [ ] Can login successfully in production

---

## 🆘 Troubleshooting

### Problem: "JWT_SECRET is not configured"

**Solution:**
1. Check `.env.local` has `JWT_SECRET=...`
2. Restart dev server: `npm run dev`
3. Verify no typos in variable name

### Problem: "User not found" when logging in

**Solution:**
1. Check Supabase Table Editor → users table
2. Verify admin user exists
3. Check `is_active = true`
4. Check `is_locked = false`

### Problem: "Invalid password" with correct password

**Solution:**
1. Verify password hash was generated correctly
2. Re-generate hash: `node scripts/generate-password-hash.js`
3. Update users table with new hash
4. Try logging in again

### Problem: "Account locked"

**Solution:**
Run in Supabase SQL Editor:
```sql
UPDATE users 
SET is_locked = false, failed_login_attempts = 0 
WHERE username = 'admin';
```

### Problem: Tables not created

**Solution:**
1. Check Supabase SQL Editor for errors
2. Verify you have admin access to Supabase
3. Try running script again
4. Check for existing tables (may need to drop first)

### Problem: Can't connect to Supabase

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check Supabase project is active
4. Check network connection

---

## 📚 Next Steps

After completing setup:

1. **Create Additional Users**
   - HR managers, finance managers, etc.
   - Use password generator for each user
   - Assign appropriate roles

2. **Configure Permissions**
   - Review user_permissions table
   - Adjust permissions as needed
   - Test access controls

3. **Set Up Monitoring**
   - Review audit logs regularly
   - Set up alerts for failed logins
   - Monitor account lockouts

4. **Security Hardening**
   - Implement CAPTCHA (future)
   - Add 2FA (future)
   - Regular password rotation
   - Security audits

5. **Documentation**
   - Document user roles and permissions
   - Create user management procedures
   - Security incident response plan

---

## 📞 Need Help?

- **Documentation:** See `SECURITY_FIXES_IMPLEMENTED.md`
- **Password Generator:** `node scripts/generate-password-hash.js`
- **Environment Validator:** Check `src/lib/envValidation.js`
- **Audit Logs:** Check Supabase → audit_logs table

---

**🎉 Congratulations!** You've successfully implemented secure authentication!

Your application now has:
- ✅ Database-backed user authentication
- ✅ Secure password hashing (PBKDF2-SHA256)
- ✅ Account lockout protection
- ✅ Comprehensive audit logging
- ✅ Role-based access control
- ✅ No hardcoded credentials

**Stay secure!** 🔐
