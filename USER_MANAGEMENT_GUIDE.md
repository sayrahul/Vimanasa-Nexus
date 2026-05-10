# 👥 User Management - Simple Guide

## 🎉 Easy User Management from Dashboard!

No more SQL scripts! You can now create and manage users directly from the dashboard.

---

## 🚀 Quick Start

### Step 1: Run the Quick Fix SQL (One Time Only)

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk/sql
2. Copy & paste: `scripts/QUICK_FIX_AUTH.sql`
3. Click "Run"
4. Restart dev server: `npm run dev`

### Step 2: Login

- Go to: http://localhost:3000
- Username: `admin`
- Password: Use the password you set when running the SQL script

### Step 3: Go to Users Tab

Click **"Users"** in the sidebar (icon with person and gear)

---

## ✨ Features

### 1. Create New User
- Click **"+ Create New User"** button
- Fill in the form:
  - Username (e.g., `john.doe`)
  - Full Name (e.g., `John Doe`)
  - Email (e.g., `john@example.com`)
  - Password (min 8 characters)
  - Role (select from dropdown)
  - Optional: Require password change on first login
- Click **"Create User"**
- Done! ✅

### 2. Edit User
- Click **"Edit"** button next to any user
- Update:
  - Full Name
  - Email
  - Role
  - Active status
- Click **"Update User"**
- Done! ✅

### 3. Reset Password
- Click **"Reset Password"** button next to any user
- Enter new password (min 8 characters)
- Confirm password
- Optional: Require password change on next login
- Click **"Reset Password"**
- Done! ✅

### 4. Delete User
- Click **"Delete"** button next to any user
- Confirm deletion
- Done! ✅

---

## 👥 User Roles

### Super Admin
- **Full access** to everything
- Can create/edit/delete users
- Can manage all data

### Admin
- **Full access** to everything
- Can create/edit/delete users
- Can manage all data

### HR Manager
- Access to:
  - Workforce directory
  - Attendance tracking
  - Leave requests
  - Recruitment
- Cannot access finance or compliance

### Finance Manager
- Access to:
  - Payroll processing
  - Invoices
  - Expenses
  - Financial ledger
- Cannot access HR or compliance

### Compliance Officer
- Access to:
  - Compliance tracking
  - Statutory reports
- Cannot access HR or finance

### Employee
- Limited access
- Can view own data only

---

## 🔐 Security Features

### Automatic
- ✅ Passwords are hashed securely (PBKDF2-SHA256)
- ✅ Account locks after 5 failed login attempts
- ✅ All actions are logged in audit trail
- ✅ Failed login attempts are tracked
- ✅ Last login time is recorded

### Manual
- ✅ Set password strength requirements
- ✅ Force password change on first login
- ✅ Deactivate users without deleting them
- ✅ Unlock locked accounts

---

## 📋 Common Tasks

### Create a New HR Manager

1. Click **"+ Create New User"**
2. Fill in:
   - Username: `hr.manager`
   - Full Name: `HR Manager`
   - Email: `hr@vimanasa.com`
   - Password: (strong password)
   - Role: **HR Manager**
3. Click **"Create User"**

### Reset a Forgotten Password

1. Find the user in the list
2. Click **"Reset Password"**
3. Enter new password
4. Check "Require password change on next login"
5. Click **"Reset Password"**
6. Tell the user their new password

### Deactivate a User (Without Deleting)

1. Find the user in the list
2. Click **"Edit"**
3. Uncheck **"Account is active"**
4. Click **"Update User"**

The user can no longer login, but their data is preserved.

### Unlock a Locked Account

1. Find the user in the list
2. Click **"Reset Password"**
3. Enter a new password
4. Click **"Reset Password"**

This automatically unlocks the account.

---

## 🎯 Best Practices

### Password Security
- ✅ Use strong passwords (min 12 characters)
- ✅ Mix uppercase, lowercase, numbers, symbols
- ✅ Don't use common passwords
- ✅ Force password change for new users
- ✅ Rotate passwords every 90 days

### User Management
- ✅ Create users with appropriate roles
- ✅ Review user permissions regularly
- ✅ Deactivate users when they leave
- ✅ Don't share admin credentials
- ✅ Use unique usernames

### Audit & Monitoring
- ✅ Check audit logs regularly
- ✅ Monitor failed login attempts
- ✅ Review locked accounts
- ✅ Track user activity

---

## 🆘 Troubleshooting

### Can't see "Users" tab?

**Solution:** Make sure you're logged in as admin or super_admin. Other roles don't have access to user management.

### "Admin access required" error?

**Solution:** Only admins can manage users. Login with admin account.

### Can't create user - "Username already exists"?

**Solution:** Choose a different username. Usernames must be unique.

### Password too weak?

**Solution:** Password must be at least 8 characters. Use a mix of:
- Uppercase letters (A-Z)
- Lowercase letters (a-z)
- Numbers (0-9)
- Special characters (!@#$%^&*...)

### Can't delete a user?

**Solution:** You cannot delete your own account. Login with a different admin account to delete users.

---

## 📊 User Table Columns

| Column | Description |
|--------|-------------|
| **User** | Full name, username, and email |
| **Role** | User's role (super_admin, admin, hr_manager, etc.) |
| **Status** | Active/Inactive and Locked status |
| **Last Login** | When the user last logged in |
| **Actions** | Edit, Reset Password, Delete buttons |

---

## 🎉 Benefits

### Before (Old Way)
- ❌ Run SQL scripts manually
- ❌ Generate password hashes in terminal
- ❌ Copy/paste hashes into SQL
- ❌ Run seed scripts
- ❌ Complicated and error-prone

### After (New Way)
- ✅ Click "Create New User" button
- ✅ Fill in a simple form
- ✅ Click "Create User"
- ✅ Done in 30 seconds!
- ✅ No technical knowledge required

---

## 📝 Example Workflow

### Onboarding a New Employee

1. **Create User Account**
   - Go to Users tab
   - Click "Create New User"
   - Username: `employee.name`
   - Role: `employee`
   - Check "Require password change on first login"
   - Click "Create User"

2. **Send Credentials**
   - Email the username and temporary password
   - Tell them to change password on first login

3. **Monitor First Login**
   - Check audit logs
   - Verify they changed their password
   - Confirm account is active

### Offboarding an Employee

1. **Deactivate Account**
   - Go to Users tab
   - Find the user
   - Click "Edit"
   - Uncheck "Account is active"
   - Click "Update User"

2. **Review Data**
   - Check their activity in audit logs
   - Archive any important data
   - Document the offboarding

3. **Optional: Delete Account**
   - After data review period
   - Click "Delete" button
   - Confirm deletion

---

## 🔗 Related Documentation

- **Security Fixes:** `SECURITY_FIXES_IMPLEMENTED.md`
- **Setup Guide:** `SECURITY_SETUP_QUICKSTART.md`
- **Login Fix:** `LOGIN_FIX_INSTRUCTIONS.md`

---

## ✅ Summary

**Old Way:**
1. Generate password hash in terminal
2. Write SQL INSERT statement
3. Run SQL in Supabase
4. Hope it works

**New Way:**
1. Click "Create New User"
2. Fill form
3. Click "Create User"
4. Done! ✅

**Time Saved:** 5 minutes → 30 seconds

**Difficulty:** Expert → Beginner

**User Friendly:** ❌ → ✅

---

**🎉 Enjoy easy user management!**

No more complicated SQL scripts or terminal commands. Everything is now point-and-click from the dashboard!
