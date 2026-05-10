# 🚀 Quick Setup: Secure Authentication

## ⚡ 5-Minute Setup Guide

Follow these steps to enable secure authentication:

---

## Step 1: Generate JWT Secret (30 seconds)

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (it will look like: `a1b2c3d4e5f6...`)

---

## Step 2: Add to .env.local (30 seconds)

Open `.env.local` and add this line:

```bash
JWT_SECRET=paste_your_generated_secret_here
```

**Example:**
```bash
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

---

## Step 3: Run SQL Migration (2 minutes)

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk/sql
   ```

2. Click "New Query"

3. Copy the entire contents of: `scripts/create-users-table.sql`

4. Paste into SQL Editor

5. Click "Run"

6. Wait for success message: ✅ Users table created successfully!

---

## Step 4: Create Admin User (2 minutes)

Run the setup script:

```bash
node scripts/setup-secure-auth.js
```

**Follow the prompts:**

1. Press Enter when asked about SQL migration (you already did it)
2. Enter a secure password for admin user
3. Confirm the password
4. Wait for success message

**Password Requirements:**
- At least 8 characters
- One lowercase letter
- One uppercase letter
- One number
- One special character

**Example strong password:** `Admin@Vimanasa2026`

---

## Step 5: Test Login (30 seconds)

1. Start dev server (if not running):
   ```bash
   npm run dev
   ```

2. Open: http://localhost:3000

3. Login with:
   - **Username:** `admin`
   - **Password:** (the password you just created)

4. ✅ You should see the dashboard!

---

## ✅ Done!

Your application now has:
- ✅ Secure password hashing (PBKDF2-SHA256)
- ✅ Database-backed authentication
- ✅ Account lockout protection
- ✅ Audit logging
- ✅ No hardcoded credentials

---

## 🚨 Troubleshooting

### Error: "JWT_SECRET is not configured"
- Make sure you added `JWT_SECRET` to `.env.local`
- Restart your dev server: `npm run dev`

### Error: "Users table does not exist"
- Run the SQL migration in Supabase SQL Editor
- File: `scripts/create-users-table.sql`

### Error: "Invalid username or password"
- Username is case-sensitive (use: `admin`)
- Make sure you're using the password you set in Step 4

### Account Locked
- Wait 30 minutes, or
- Run this in Supabase SQL Editor:
  ```sql
  UPDATE users 
  SET locked_until = NULL, failed_login_attempts = 0 
  WHERE username = 'admin';
  ```

---

## 📝 What Changed?

**Old System (Insecure):**
- ❌ Hardcoded password: `Vimanasa@2026`
- ❌ Stored in source code
- ❌ Visible in Git history

**New System (Secure):**
- ✅ Password hashed with PBKDF2-SHA256
- ✅ Stored in database
- ✅ No credentials in code

---

## 🔐 Production Deployment

When deploying to production:

1. **Generate a NEW JWT_SECRET** (don't reuse development secret)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to Vercel Environment Variables:**
   - Go to: Vercel Dashboard → Settings → Environment Variables
   - Add: `JWT_SECRET` = your_new_production_secret

3. **Run setup script for production database:**
   ```bash
   # Set production env vars
   export NEXT_PUBLIC_SUPABASE_URL=your_prod_url
   export SUPABASE_SERVICE_ROLE_KEY=your_prod_key
   export JWT_SECRET=your_prod_jwt_secret
   
   # Run setup
   node scripts/setup-secure-auth.js
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## 📚 More Information

For detailed documentation, see: `SECURE_AUTH_IMPLEMENTATION.md`

---

**Total Time: ~5 minutes**  
**Difficulty: Easy**  
**Security Level: Enterprise-grade** 🔒

