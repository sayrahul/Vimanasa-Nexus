# 🚀 Deploy to Vercel - Complete Guide

## Why Vercel?

Your Next.js app uses **Edge Runtime** API routes, which work perfectly on Vercel but have compatibility issues with Cloudflare Workers. Vercel is made by the Next.js team and has native support for all Next.js features.

---

## ✅ Quick Deploy (5 Minutes)

### Method 1: Via Vercel Dashboard (Easiest)

#### Step 1: Go to Vercel
1. Visit: https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Sign in with **GitHub** (recommended)

#### Step 2: Import Your Repository
1. Click **"Add New..."** → **"Project"**
2. Find **"Vimanasa-Nexus"** repository
3. Click **"Import"**

#### Step 3: Configure Project
1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `./` (leave as is)
3. **Build Command:** `npm run build` (auto-filled)
4. **Output Directory:** `.next` (auto-filled)

#### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these:

```
NEXT_PUBLIC_ADMIN_USER = admin
NEXT_PUBLIC_ADMIN_PASSWORD = Vimanasa@2026
NEXT_PUBLIC_SUPABASE_URL = https://nzwwwhufprdultuyzezk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTk4NDYsImV4cCI6MjA5MzYzNTg0Nn0.oU87XJsMFa_BVnn0dyyq-zjzqfNi8KpOnGCs61e0T9Y
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg
NEXT_PUBLIC_GEMINI_API_KEY = AIzaSyAkhRusthxPgI8h6p8T2NtFO7VOVm7eaIk
```

**Important:** Make sure to select **"Production"**, **"Preview"**, and **"Development"** for each variable!

#### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://vimanasa-nexus.vercel.app`

---

### Method 2: Via Vercel CLI (Alternative)

If you prefer command line:

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? **vimanasa-nexus**
- In which directory is your code located? **./
**
- Want to override settings? **N**

#### Step 4: Add Environment Variables
```bash
vercel env add NEXT_PUBLIC_ADMIN_USER
# Enter: admin
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_ADMIN_PASSWORD
# Enter: Vimanasa@2026
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://nzwwwhufprdultuyzezk.supabase.co
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTk4NDYsImV4cCI6MjA5MzYzNTg0Nn0.oU87XJsMFa_BVnn0dyyq-zjzqfNi8KpOnGCs61e0T9Y
# Select: Production, Preview, Development

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d3d3aHVmcHJkdWx0dXl6ZXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1OTg0NiwiZXhwIjoyMDkzNjM1ODQ2fQ.KdjN1PTGSbZhLfFRrgHZeoX2ktcNhHMYahG9goR7iOg
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_GEMINI_API_KEY
# Enter: AIzaSyAkhRusthxPgI8h6p8T2NtFO7VOVm7eaIk
# Select: Production, Preview, Development
```

#### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

---

## 🧪 Test After Deployment

Once deployed, you'll get a URL like: `https://vimanasa-nexus.vercel.app`

### Test 1: Check Environment
Visit: `https://vimanasa-nexus.vercel.app/api/check-env`

**Expected:**
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

### Test 2: Check API
Visit: `https://vimanasa-nexus.vercel.app/api/database?table=workforce`

**Expected:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### Test 3: Check Dashboard
Visit: `https://vimanasa-nexus.vercel.app`

- Login with: `admin` / `Vimanasa@2026`
- All tabs should load data
- No 500 errors in console

---

## 🎯 Why This Will Work

| Feature | Cloudflare Workers | Vercel |
|---------|-------------------|--------|
| Next.js Edge Runtime | ❌ Limited support | ✅ Full support |
| API Routes | ❌ Compatibility issues | ✅ Native support |
| Environment Variables | ⚠️ Complex setup | ✅ Simple setup |
| Build Process | ❌ Requires custom config | ✅ Automatic |
| CORS | ❌ Manual configuration | ✅ Handled automatically |

---

## 📊 Comparison

### Current (Cloudflare):
```
❌ 500 errors on all API routes
❌ CORS errors
❌ Environment variables not working
❌ Edge Runtime compatibility issues
```

### After Vercel Deployment:
```
✅ All API routes return 200
✅ No CORS errors
✅ Environment variables work perfectly
✅ Full Next.js Edge Runtime support
✅ Automatic deployments on Git push
```

---

## 🔗 Custom Domain (Optional)

After deploying to Vercel, you can add your custom domain:

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add: `nexus.vimanasa.com`
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

---

## 💡 Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch = automatic production deployment
- Every pull request = automatic preview deployment
- No manual deployment needed!

---

## ✅ Success Checklist

After deploying to Vercel:

- [ ] Project deployed successfully
- [ ] All 6 environment variables added
- [ ] `/api/check-env` returns "OK"
- [ ] `/api/database?table=workforce` returns 200
- [ ] Dashboard loads without errors
- [ ] Login works
- [ ] All tabs show data
- [ ] No 500 errors in console

---

## 🚀 Next Steps

1. **Deploy to Vercel** using Method 1 (Dashboard) - easiest!
2. **Add environment variables** during setup
3. **Wait 2-3 minutes** for build
4. **Test** using the URLs above
5. **Celebrate** - everything will work! 🎉

---

## 📝 Note About Cloudflare

You can keep your Cloudflare deployment for testing, but for production use Vercel. Your app is specifically built for Vercel's infrastructure.

---

**Ready to deploy? Go to https://vercel.com and follow Method 1!** 🚀

It will take 5 minutes and everything will work perfectly!
