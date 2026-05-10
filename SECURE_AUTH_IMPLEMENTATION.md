# 🔐 Secure Authentication Implementation

## Overview

This document describes the secure authentication system implemented for Vimanasa Nexus. The new system replaces hardcoded credentials with database-backed authentication using industry-standard security practices.

---

## ✅ What Was Implemented

### 1. **Database-Backed User Management**
- Users stored in Supabase PostgreSQL database
- Proper user table with all necessary fields
- Row Level Security (RLS) policies enabled
- Audit logging for all authentication events

### 2. **Secure Password Hashing**
- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (OWASP recommended)
- **Salt**: 128-bit random salt per password
- **Key Length**: 256 bits
- **Edge Runtime Compatible**: Uses Web Crypto API

### 3. **Account Security Features**
- ✅ Account lockout after 5 failed login attempts
- ✅ 30-minute lockout duration
- ✅ Automatic password rehashing when security parameters improve
- ✅ Failed login attempt tracking
- ✅ Last login timestamp
- ✅ Active/inactive user status

### 4. **Audit Logging**
- All login attempts logged (success and failure)
- IP address tracking
- User agent tracking
- Timestamp for all events
- Detailed error messages for failed attempts

### 5. **JWT Token Security**
- **Required**: JWT_SECRET environment variable (no fallback)
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Claims**: User ID, username, role, email

---

## 📁 Files Created

### Core Authentication Files

1. **`src/lib/passwordHash.js`**
   - PBKDF2-SHA256 password hashing
   - Password verification with constant-time comparison
   - Password strength validation
   - Secure password generation
   - Edge Runtime compatible

2. **`src/lib/authSecure.js`**
   - Database-backed authentication
   - JWT token creation and verification
   - User management functions
   - Account lockout logic
   - Audit logging

3. **`scripts/create-users-table.sql`**
   - Users table schema
   - Audit log table schema
   - RLS policies
   - Helper functions
   - Indexes for performance

4. **`scripts/setup-secure-auth.js`**
   - Interactive setup script
   - Creates users table
   - Creates admin user with secure password
   - Validates environment variables

---

## 🚀 Setup Instructions

### Step 1: Set Environment Variables

Add to your `.env.local` file:

```bash
# Supabase Configuration (already set)
NEXT_PUBLIC_SUPABASE_URL=https://nzwwwhufprdultuyzezk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Secret (REQUIRED - generate a strong random string)
JWT_SECRET=your_very_secure_random_string_at_least_32_characters_long
```

**Generate a secure JWT_SECRET:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Using online generator
# Visit: https://generate-secret.vercel.app/32
```

### Step 2: Run the SQL Migration

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk/sql
2. Copy the contents of `scripts/create-users-table.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify success message

### Step 3: Run the Setup Script

```bash
node scripts/setup-secure-auth.js
```

The script will:
1. Validate environment variables
2. Check if users table exists
3. Prompt you to create a secure admin password
4. Create the admin user in the database

**Password Requirements:**
- At least 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

### Step 4: Test the Login

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000

3. Login with:
   - **Username**: `admin`
   - **Password**: (the password you set in Step 3)

4. Verify successful login and dashboard access

---

## 🔒 Security Features

### Password Hashing

**Algorithm Details:**
```
Hash Format: iterations$salt$hash
Example: 100000$base64_salt$base64_hash

Process:
1. Generate random 128-bit salt
2. Apply PBKDF2-SHA256 with 100,000 iterations
3. Produce 256-bit hash
4. Store in format: iterations$salt$hash
```

**Why PBKDF2?**
- ✅ NIST approved
- ✅ OWASP recommended
- ✅ Works in Edge Runtime (Web Crypto API)
- ✅ Configurable iterations (future-proof)
- ✅ Resistant to rainbow table attacks

### Account Lockout

**Lockout Logic:**
```
Failed Attempts | Action
----------------|------------------
1-4             | Log attempt, increment counter
5               | Lock account for 30 minutes
After lockout   | Reset counter on successful login
```

**Benefits:**
- Prevents brute force attacks
- Automatic unlock after timeout
- Manual unlock by admin (if needed)

### Audit Logging

**Logged Events:**
- Login attempts (success/failure)
- Password changes
- Account lockouts
- User creation/updates

**Logged Data:**
- User ID and username
- IP address
- User agent
- Timestamp
- Success/failure status
- Error messages

---

## 🔄 Migration from Old System

### What Changed

**Before (Insecure):**
```javascript
// Hardcoded users in code
const USERS = [
  {
    username: 'admin',
    password: 'Vimanasa@2026', // Plaintext!
    role: 'super_admin'
  }
];

// Weak password verification
function verifyPassword(plain, hash) {
  return hash === passwordMap[plain];
}
```

**After (Secure):**
```javascript
// Users in database with hashed passwords
const user = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('username', username)
  .single();

// Secure password verification
const isValid = await verifyPassword(
  password,
  user.password_hash
);
```

### Breaking Changes

1. **No more hardcoded users** - All users must be in database
2. **No more plaintext passwords** - All passwords are hashed
3. **JWT_SECRET required** - No fallback to test secret
4. **User object structure changed**:
   - `name` → `full_name`
   - `permissions` → removed (use role-based)

---

## 👥 User Management

### Create New User (Admin Only)

```javascript
import { createUser } from '@/lib/authSecure';

const newUser = await createUser({
  username: 'john.doe',
  password: 'SecurePass123!',
  email: 'john.doe@vimanasa.com',
  full_name: 'John Doe',
  role: 'hr_manager'
});
```

### Update User Password

```javascript
import { updatePassword } from '@/lib/authSecure';

await updatePassword(userId, 'NewSecurePass123!');
```

### Get User by ID

```javascript
import { getUserById } from '@/lib/authSecure';

const user = await getUserById(userId);
```

### Check Permissions

```javascript
import { hasPermission } from '@/lib/authSecure';

if (hasPermission(user, 'workforce')) {
  // User can access workforce data
}
```

---

## 🧪 Testing

### Test Login API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "System Administrator",
    "email": "admin@vimanasa.com",
    "role": "super_admin"
  },
  "token": "eyJhbGc..."
}
```

### Test Account Lockout

1. Attempt login with wrong password 5 times
2. Verify account is locked
3. Wait 30 minutes or manually unlock in database
4. Verify login works again

### Test Audit Logging

```sql
-- View recent login attempts
SELECT 
  username,
  action,
  success,
  error_message,
  ip_address,
  created_at
FROM user_audit_log
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔐 Production Deployment

### Vercel Deployment

1. **Set Environment Variables in Vercel:**
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Add `JWT_SECRET` (use a strong random string)
   - Verify Supabase variables are set

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Run Setup Script on Production Database:**
   ```bash
   # Set production environment variables locally
   export NEXT_PUBLIC_SUPABASE_URL=your_prod_url
   export SUPABASE_SERVICE_ROLE_KEY=your_prod_key
   export JWT_SECRET=your_prod_jwt_secret
   
   # Run setup
   node scripts/setup-secure-auth.js
   ```

### Security Checklist

- [ ] JWT_SECRET is set and unique (not the same as development)
- [ ] JWT_SECRET is at least 32 characters long
- [ ] Supabase RLS policies are enabled
- [ ] Admin password is strong and unique
- [ ] Old auth.js file is removed
- [ ] No hardcoded credentials in code
- [ ] Audit logging is working
- [ ] Account lockout is tested
- [ ] HTTPS is enforced

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Audit Log Table

```sql
CREATE TABLE user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚨 Troubleshooting

### Issue: "JWT_SECRET is not configured"

**Solution:**
1. Add `JWT_SECRET` to `.env.local`
2. Generate a secure random string (32+ characters)
3. Restart development server

### Issue: "Users table does not exist"

**Solution:**
1. Run the SQL migration in Supabase SQL Editor
2. Verify table creation with: `SELECT * FROM users LIMIT 1;`

### Issue: "Account is locked"

**Solution:**
1. Wait 30 minutes for automatic unlock
2. Or manually unlock in database:
   ```sql
   UPDATE users 
   SET locked_until = NULL, failed_login_attempts = 0 
   WHERE username = 'admin';
   ```

### Issue: "Invalid username or password"

**Solution:**
1. Verify username is correct (case-sensitive)
2. Verify password is correct
3. Check audit log for details:
   ```sql
   SELECT * FROM user_audit_log 
   WHERE username = 'admin' 
   ORDER BY created_at DESC LIMIT 5;
   ```

---

## 📚 Additional Resources

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Summary

**What We Fixed:**
- ❌ Hardcoded credentials → ✅ Database-backed users
- ❌ Plaintext passwords → ✅ PBKDF2-SHA256 hashed passwords
- ❌ No account lockout → ✅ 5 attempts, 30-minute lockout
- ❌ No audit logging → ✅ Complete audit trail
- ❌ Weak JWT secret → ✅ Required strong JWT_SECRET
- ❌ No password validation → ✅ Strong password requirements

**Security Improvements:**
- 🔒 100,000 PBKDF2 iterations (OWASP recommended)
- 🔒 Constant-time password comparison (prevents timing attacks)
- 🔒 Account lockout (prevents brute force)
- 🔒 Audit logging (compliance and forensics)
- 🔒 Row Level Security (database-level protection)
- 🔒 Edge Runtime compatible (works on Vercel, Cloudflare)

**Next Steps:**
1. ✅ Set JWT_SECRET environment variable
2. ✅ Run SQL migration
3. ✅ Run setup script
4. ✅ Test login
5. ✅ Deploy to production

---

**🎉 Your application now has enterprise-grade authentication security!**

