# 🔒 Authentication Migration Guide

## Current Status

**Authentication is temporarily disabled for development.**

The Google Sheets API routes currently have authentication checks commented out to allow the existing frontend to work without modifications.

---

## Why Authentication is Disabled

The new authentication system was added, but the main `page.js` still uses the old `axios` directly without authentication tokens. To prevent breaking the app, authentication is temporarily disabled with `// TEMPORARY` comments.

---

## When to Enable Authentication

Enable authentication when:
1. You're ready to update the frontend to use the new auth system
2. You're deploying to production
3. You want to test the full authentication flow

---

## How to Enable Authentication

### **Step 1: Update Frontend to Use New Auth System**

Replace axios calls with the new API client:

**Before (Current):**
```javascript
import axios from 'axios';

const response = await axios.get(`/api/gsheets?sheet=${sheetName}`);
const data = response.data;
```

**After (With Auth):**
```javascript
import { sheetsAPI } from '@/lib/apiClient';
import { withErrorHandling } from '@/lib/errorHandler';

await withErrorHandling(
  async () => {
    const data = await sheetsAPI.get(sheetName);
    setData(prev => ({ ...prev, [tab]: data }));
  },
  {
    loadingMessage: 'Loading data...',
    showSuccess: false,
  }
);
```

### **Step 2: Add Login Flow**

Update the Login component to use the new auth system:

```javascript
import { authAPI } from '@/lib/apiClient';
import { showError, showSuccess } from '@/lib/errorHandler';

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await authAPI.login(username, password);
    setUser(response.user);
    setIsAuthenticated(true);
    showSuccess(`Welcome, ${response.user.name}!`);
  } catch (error) {
    showError(error);
  }
};
```

### **Step 3: Enable Authentication in API Routes**

In `src/app/api/gsheets/route.js`, uncomment the authentication code:

**Find and uncomment these lines in GET, POST, PUT, DELETE:**

```javascript
// BEFORE (Disabled):
// TEMPORARY: Skip authentication for development
// TODO: Re-enable authentication in production
// const user = await requireAuth(req);
// if (user instanceof Response) return user;

// AFTER (Enabled):
const user = await requireAuth(req);
if (user instanceof Response) return user;
```

**And uncomment permission checks:**

```javascript
// BEFORE (Disabled):
// TEMPORARY: Skip permission check for development
// TODO: Re-enable permission checks in production
// const resource = SHEET_PERMISSIONS[sheetName] || sheetName.toLowerCase();
// const permissionError = requirePermission(user, `${resource}:read`);
// if (permissionError) return permissionError;

// AFTER (Enabled):
const resource = SHEET_PERMISSIONS[sheetName] || sheetName.toLowerCase();
const permissionError = requirePermission(user, `${resource}:read`);
if (permissionError) return permissionError;
```

### **Step 4: Test Authentication**

1. Start the dev server: `npm run dev`
2. Try to access data without logging in - should get 401 error
3. Log in with credentials
4. Access data - should work with authentication

---

## Quick Migration Script

Here's a complete example of updating `page.js`:

```javascript
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { sheetsAPI, authAPI } from '@/lib/apiClient';
import { withErrorHandling, showError, showSuccess } from '@/lib/errorHandler';
// ... other imports

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState({
    // ... your data state
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.verify();
        if (response.success) {
          setCurrentUser(response.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Not authenticated, show login
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch data with authentication
  const fetchData = useCallback(async (tab) => {
    await withErrorHandling(
      async () => {
        const sheetName = sheetMapping[tab];
        const data = await sheetsAPI.get(sheetName);
        setData(prev => ({ ...prev, [tab]: data }));
      },
      {
        loadingMessage: 'Loading data...',
        showSuccess: false,
        errorTitle: 'Failed to load data',
      }
    );
  }, []);

  // Handle login
  const handleLogin = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      showSuccess(`Welcome, ${response.user.name}!`);
    } catch (error) {
      showError(error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    // ... your dashboard JSX
  );
}
```

---

## Test Users

Once authentication is enabled, use these test users:

```javascript
// Super Admin (Full Access)
Username: admin
Password: Vimanasa@2026

// HR Manager (HR Only)
Username: hr_manager
Password: hr123

// Finance Manager (Finance Only)
Username: finance
Password: finance123
```

---

## Rollback Plan

If you need to disable authentication again:

1. Add `// TEMPORARY:` comments back to auth checks
2. Comment out `requireAuth` and `requirePermission` calls
3. Restart dev server

---

## Production Deployment

**IMPORTANT:** Before deploying to production:

1. ✅ Enable authentication (remove TEMPORARY comments)
2. ✅ Update frontend to use new auth system
3. ✅ Test all user roles
4. ✅ Test all CRUD operations
5. ✅ Verify permissions work correctly
6. ✅ Change default passwords
7. ✅ Set strong JWT_SECRET in production

---

## Benefits of Enabling Authentication

Once enabled, you'll have:
- ✅ Secure API endpoints
- ✅ Role-based access control
- ✅ Permission-based operations
- ✅ Audit trail (who did what)
- ✅ Multi-user support
- ✅ Production-ready security

---

## Need Help?

**Documentation:**
- Complete auth guide: `PHASE_1_2_IMPLEMENTATION.md`
- API client usage: `src/lib/apiClient.js`
- Error handling: `src/lib/errorHandler.js`

**Test Authentication:**
```bash
# In browser console
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'Vimanasa@2026'
  })
})
.then(r => r.json())
.then(console.log);
```

---

**Status:** Authentication temporarily disabled for development  
**Action Required:** Update frontend when ready for production  
**Priority:** Medium (enable before production deployment)

© 2026 Vimanasa Services LLP

