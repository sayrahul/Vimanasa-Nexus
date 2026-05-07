# 🔴 PRODUCTION 500 ERROR FIX

## Problem
Your production site is showing 500 errors for all `/api/database` requests:
- `/api/database?table=workforce` → 500
- `/api/database?table=clients` → 500
- `/api/database?table=partners` → 500
- All other tables → 500

**Local development works fine**, but production fails.

---

## Root Cause

The `SUPABASE_SERVICE_ROLE_KEY` environment variable is **NOT available in production** because:

1. It's not prefixed with `NEXT_PUBLIC_` (so it's not bundled into the client build)
2. It's a server-side only variable
3. Your hosting platform doesn't have it configured

---

## ✅ IMMEDIATE FIX

### Step 1: Add Missing Environment Variable to Production

#### For Vercel:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variable**
   - Go to: Settings → Environment Variables
   - Click "Add New"
   
   **Variable to Add:**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg
   Environment: Production, Preview, Development (check all)
   ```

3. **Redeploy**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

#### For Netlify:

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Select your site

2. **Add Environment Variable**
   - Go to: Site settings → Environment variables
   - Click "Add a variable"
   
   **Variable to Add:**
   ```
   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg
   Scopes: Builds, Functions, Post processing (check all)
   ```

3. **Trigger Deploy**
   - Go to Deploys tab
   - Click "Trigger deploy"
   - Select "Deploy site"

#### For Cloudflare Pages:

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Select your project

2. **Add Environment Variable**
   - Go to: Settings → Environment variables
   - Click "Add variable"
   
   **Variable to Add:**
   ```
   Variable name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg
   Environment: Production
   ```

3. **Redeploy**
   - Create a new deployment or trigger rebuild

---

## Step 2: Verify All Required Environment Variables

Make sure ALL these variables are set in production:

```bash
# Required for authentication
NEXT_PUBLIC_ADMIN_USER=admin
NEXT_PUBLIC_ADMIN_PASSWORD=Vimanasa@2026

# Required for Supabase (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://nzwwwhufprdultuyzezk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTk4NDYsImV4cCI6MjA5MzYzNTg0Nn0.oU87XJsMFa_BVnn0dyyq-zjzqfNi8KpOnGCs61e0T9Y

# Required for Supabase (server-side) ⚠️ THIS IS THE MISSING ONE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg

# Optional (for AI features)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAkhRusthxPgI8h6p8T2NtFO7VOVm7eaIk
```

---

## Step 3: Test After Deployment

### A. Check Environment Variables

Open browser console on your production site and run:

```javascript
// This will work (NEXT_PUBLIC_ variables)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// This won't show (server-side only, but that's correct)
console.log('Service Role:', process.env.SUPABASE_SERVICE_ROLE_KEY); // undefined is OK
```

### B. Test API Endpoint

Open browser console and run:

```javascript
// Test workforce endpoint
fetch('/api/database?table=workforce')
  .then(r => r.json())
  .then(data => console.log('Workforce data:', data))
  .catch(err => console.error('Error:', err));

// Test clients endpoint
fetch('/api/database?table=clients')
  .then(r => r.json())
  .then(data => console.log('Clients data:', data))
  .catch(err => console.error('Error:', err));
```

**Expected Result:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

**If still getting 500 error**, check the next section.

---

## 🔍 Advanced Debugging

### Check Production Logs

#### Vercel:
1. Go to your project dashboard
2. Click on the failing deployment
3. Click "Functions" tab
4. Look for `/api/database` logs
5. Check for error messages

#### Netlify:
1. Go to your site dashboard
2. Click "Functions" tab
3. Find the database function
4. Check logs for errors

#### Cloudflare:
1. Go to your project
2. Click "View logs"
3. Look for API errors

### Common Error Messages and Fixes

#### Error: "Supabase is not configured"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables

#### Error: "relation 'employees' does not exist"
**Fix:** Run the database setup SQL scripts in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Run `scripts/create-all-tables.sql`

#### Error: "Invalid API key"
**Fix:** Verify the Supabase keys are correct:
1. Go to Supabase Dashboard → Settings → API
2. Copy the correct keys
3. Update environment variables

---

## 🚨 Alternative Fix: Use Anon Key for All Requests

If you can't add the service role key, you can modify the code to use only the anon key (less secure but will work):

**Edit `src/lib/supabase.js`:**

```javascript
// Client for server-side operations (uses anon key as fallback)
export const supabaseAdmin = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

**Note:** This is less secure because it relies on Row Level Security (RLS) policies. Make sure your Supabase tables have proper RLS policies set up.

---

## ✅ Verification Checklist

After deploying the fix:

- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to production environment
- [ ] Redeployed the application
- [ ] Waited 2-3 minutes for deployment to complete
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Tested `/api/database?table=workforce` - returns 200
- [ ] Tested `/api/database?table=clients` - returns 200
- [ ] Dashboard loads without 500 errors
- [ ] All tabs show data correctly

---

## 📊 Expected Behavior After Fix

### Before Fix:
```
GET /api/database?table=workforce → 500 Internal Server Error
GET /api/database?table=clients → 500 Internal Server Error
Console: "Error fetching workforce data: AxiosError: Request failed with status code 500"
```

### After Fix:
```
GET /api/database?table=workforce → 200 OK
GET /api/database?table=clients → 200 OK
Console: No errors
Dashboard: Shows all data correctly
```

---

## 🎯 Quick Command Reference

### Test API from Command Line:

```bash
# Test workforce endpoint
curl https://your-production-url.com/api/database?table=workforce

# Test clients endpoint
curl https://your-production-url.com/api/database?table=clients

# Should return JSON with success: true
```

### Test from Browser Console:

```javascript
// Quick test all endpoints
const tables = ['workforce', 'clients', 'partners', 'payroll', 'leave', 'finance', 'expenses', 'compliance'];

tables.forEach(table => {
  fetch(`/api/database?table=${table}`)
    .then(r => r.json())
    .then(data => console.log(`✅ ${table}:`, data.success ? 'OK' : 'FAIL'))
    .catch(err => console.error(`❌ ${table}:`, err));
});
```

---

## 💡 Why This Happens

1. **Local Development:** Uses `.env.local` file which has all variables including `SUPABASE_SERVICE_ROLE_KEY`

2. **Production:** Only includes variables that are:
   - Prefixed with `NEXT_PUBLIC_` (bundled into client code)
   - OR explicitly set in hosting platform environment variables

3. **The Fix:** Manually add `SUPABASE_SERVICE_ROLE_KEY` to your hosting platform's environment variables

---

## 🎉 Success!

Once you've added the environment variable and redeployed:

✅ All API endpoints will return 200 OK
✅ Dashboard will load data correctly
✅ No more 500 errors in console
✅ Application fully functional

---

**Need help?** Share:
1. Your hosting platform (Vercel/Netlify/Cloudflare)
2. Screenshot of environment variables in dashboard
3. Error logs from production

---

**Built with ❤️ for Vimanasa Services LLP**
