# 🔧 Cloudflare Workers Fix

## Problem
Your site is deployed on Cloudflare Workers and returning 500 errors because environment variables are not configured for Cloudflare.

**Your production URL:** https://vimanasa-nexus.rahuljadhav44.workers.dev

---

## ✅ Solution: Add Environment Variables to Cloudflare

### Method 1: Via Cloudflare Dashboard (RECOMMENDED)

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Login to your account
   - Click **Workers & Pages** in the left sidebar
   - Find and click **vimanasa-nexus**

2. **Navigate to Settings:**
   - Click the **Settings** tab
   - Click **Variables and Secrets** (or **Environment Variables**)

3. **Add These Variables:**

   Click **"Add variable"** for each:

   **Variable 1:**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg
   Type: Text (not encrypted)
   Environment: Production
   ```

   **Variable 2:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://nzwwwhufprdultuyzezk.supabase.co
   Type: Text
   Environment: Production
   ```

   **Variable 3:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTk4NDYsImV4cCI6MjA5MzYzNTg0Nn0.oU87XJsMFa_BVnn0dyyq-zjzqfNi8KpOnGCs61e0T9Y
   Type: Text
   Environment: Production
   ```

   **Variable 4:**
   ```
   Name: NEXT_PUBLIC_ADMIN_USER
   Value: admin
   Type: Text
   Environment: Production
   ```

   **Variable 5:**
   ```
   Name: NEXT_PUBLIC_ADMIN_PASSWORD
   Value: Vimanasa@2026
   Type: Text
   Environment: Production
   ```

   **Variable 6:**
   ```
   Name: NEXT_PUBLIC_GEMINI_API_KEY
   Value: AIzaSyAkhRusthxPgI8h6p8T2NtFO7VOVm7eaIk
   Type: Text
   Environment: Production
   ```

4. **Save and Deploy:**
   - Click **"Save"** or **"Deploy"**
   - Wait 1-2 minutes for changes to propagate

---

### Method 2: Via wrangler.jsonc (Alternative)

If you prefer to configure via code:

1. **Replace your `wrangler.jsonc` with this:**

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "vimanasa-nexus",
  "main": "./_worker.js",
  "compatibility_date": "2024-11-01",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "vars": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://nzwwwhufprdultuyzezk.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTk4NDYsImV4cCI6MjA5MzYzNTg0Nn0.oU87XJsMFa_BVnn0dyyq-zjzqfNi8KpOnGCs61e0T9Y",
    "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg",
    "NEXT_PUBLIC_ADMIN_USER": "admin",
    "NEXT_PUBLIC_ADMIN_PASSWORD": "Vimanasa@2026",
    "NEXT_PUBLIC_GEMINI_API_KEY": "AIzaSyAkhRusthxPgI8h6p8T2NtFO7VOVm7eaIk"
  }
}
```

2. **Redeploy:**
```bash
npm run deploy
# or
npx wrangler deploy
```

---

## 🧪 Test After Deployment

Once deployed, test with this in browser console:

```javascript
fetch('https://vimanasa-nexus.rahuljadhav44.workers.dev/api/check-env')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected Result:**
```json
{
  "status": "OK",
  "checks": {
    "supabaseServiceRoleKey": {
      "exists": true,
      "value": "SET (length: 219)"
    }
  }
}
```

---

## 📋 Quick Checklist

- [ ] Go to Cloudflare Dashboard
- [ ] Navigate to Workers & Pages → vimanasa-nexus
- [ ] Click Settings → Variables and Secrets
- [ ] Add all 6 environment variables listed above
- [ ] Save changes
- [ ] Wait 1-2 minutes
- [ ] Test using the console command above
- [ ] Verify `/api/database?table=workforce` returns 200

---

## 🎯 Why This is Different from Vercel/Netlify

**Cloudflare Workers** requires environment variables to be:
1. Added in the Cloudflare Dashboard under "Variables and Secrets"
2. OR defined in `wrangler.jsonc` under the `vars` section
3. Then redeployed

Simply adding them to your local `.env.local` file doesn't work for Cloudflare Workers in production.

---

## ✅ Success Indicators

After adding variables and redeploying:

- ✅ `/api/check-env` returns `"status": "OK"`
- ✅ `/api/database?table=workforce` returns 200 (not 500)
- ✅ Dashboard loads data without errors
- ✅ No 500 errors in browser console

---

**Follow Method 1 (Dashboard) - it's the easiest and most reliable!** 🚀
