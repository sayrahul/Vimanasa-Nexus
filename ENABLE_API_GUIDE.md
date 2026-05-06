# 🚀 Enable Google Sheets API - Step by Step

## Current Status
✅ Service account created and has Editor access  
✅ Google Sheet shared with: `rahul-mwsnoc@appspot.gserviceaccount.com`  
✅ Automated setup script ready: `auto-setup.js`  
❌ **Google Sheets API not enabled** ← YOU ARE HERE

---

## 🎯 What You Need to Do (2 Minutes)

### Step 1: Enable the Google Sheets API

1. **Click this link** (it will open Google Cloud Console):
   ```
   https://console.cloud.google.com/apis/library/sheets.googleapis.com
   ```

2. **You'll see a page titled "Google Sheets API"**

3. **Look for your project name** at the top (should be something like "My Project" or similar)
   - If you see a different project, click the project name and select the correct one

4. **Click the blue "ENABLE" button**
   - It's a big blue button in the middle of the page
   - Wait 5-10 seconds for it to enable

5. **You'll see "API enabled" confirmation**
   - The page will change to show "Manage" instead of "Enable"
   - This means it worked! ✅

---

### Step 2: Run the Automated Setup

Now that the API is enabled, run the setup script:

```bash
node auto-setup.js
```

**What this script will do:**
1. ✅ Create "Clients" sheet with 2 sample clients
2. ✅ Create "Client_Invoices" sheet with headers
3. ✅ Update "Employees" sheet with 20 new columns
4. ✅ Format all headers (blue background, white text)
5. ✅ Add sample data so you can test immediately

**Expected output:**
```
🚀 Starting Automated Google Sheets Setup

📊 Spreadsheet ID: 1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM
📧 Service Account: rahul-mwsnoc@appspot.gserviceaccount.com

🔐 Authenticating with Google Sheets API...
✅ Connected to: "Your Sheet Name"

📋 Existing sheets: Dashboard, Employees, Attendance, Leaves

📄 Setting up Clients sheet...
   ✅ Clients sheet created
   ✅ Headers and sample data added
   ✅ Headers formatted (blue background, white text)

📄 Setting up Client_Invoices sheet...
   ✅ Client_Invoices sheet created
   ✅ Headers added
   ✅ Headers formatted

📄 Updating Employees sheet...
   📊 Current columns: 10
   📝 Adding 20 new columns
   ✅ New columns added
   📊 Total columns now: 30
   ✅ New headers formatted

======================================================================
🎉 SETUP COMPLETE!
======================================================================

✅ What was set up:
   1. Clients sheet - Created with 2 sample clients
   2. Client_Invoices sheet - Created and ready for invoices
   3. Employees sheet - Updated with 20 new columns
   4. All headers formatted (blue background, white text)

🔗 Your Google Sheet:
   https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

🚀 Next Steps:
   1. Open your app: http://localhost:3001
   2. Login: admin / Vimanasa@2026
   3. Go to Clients tab - you should see 2 clients!
   4. Go to Workforce tab - deploy employees
   5. Go to Invoices tab - generate invoices

✨ Your Outsourcing OS is ready to use!
```

---

### Step 3: Verify the Setup

After the script completes, verify everything works:

```bash
node test-setup.js
```

**This will test:**
- ✅ Clients sheet exists with sample data
- ✅ Client_Invoices sheet is ready
- ✅ Employees sheet has all new columns
- ✅ API connectivity is working

---

### Step 4: Test in Your App

1. **Open your app**: http://localhost:3001
2. **Login**: admin / Vimanasa@2026
3. **Go to "Clients" tab** (in sidebar)
   - You should see 2 sample clients:
     - Zilla Parishad IT Department
     - Tech Corp India
4. **Go to "Workforce" tab**
   - Deploy an employee to a client
   - Set their Pay Rate and Bill Rate
5. **Go to "Invoices" tab**
   - Generate an invoice for a client
   - Download the PDF

---

## 🚨 Troubleshooting

### If you see "unregistered callers" error:
- The API is not enabled yet
- Go back to Step 1 and enable it
- Make sure you're in the correct Google Cloud project

### If you see "permission denied" error:
- The service account doesn't have access
- Go to your Google Sheet
- Click "Share" button
- Make sure `rahul-mwsnoc@appspot.gserviceaccount.com` has "Editor" access

### If you see "spreadsheet not found" error:
- Check the Spreadsheet ID in `.env.local`
- Should be: `1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM`

### If the script hangs or times out:
- Check your internet connection
- Make sure you're not behind a firewall blocking Google APIs
- Try running the script again

---

## 📸 Visual Guide

### What the "Enable" button looks like:

```
┌─────────────────────────────────────────────────┐
│  Google Sheets API                              │
│                                                 │
│  [Icon] Google Sheets API                      │
│                                                 │
│  Read, write, and format Google Sheets         │
│                                                 │
│         ┌─────────────────┐                    │
│         │  🔵 ENABLE      │  ← Click this!     │
│         └─────────────────┘                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### After enabling, you'll see:

```
┌─────────────────────────────────────────────────┐
│  Google Sheets API                              │
│                                                 │
│  ✅ API enabled                                 │
│                                                 │
│         ┌─────────────────┐                    │
│         │  MANAGE         │                    │
│         └─────────────────┘                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ⏱️ Time Required

- **Step 1** (Enable API): 1 minute
- **Step 2** (Run script): 30 seconds
- **Step 3** (Verify): 30 seconds
- **Step 4** (Test in app): 2 minutes

**Total: ~4 minutes** ⚡

---

## 🎯 Summary

1. **Enable API**: https://console.cloud.google.com/apis/library/sheets.googleapis.com
2. **Run setup**: `node auto-setup.js`
3. **Verify**: `node test-setup.js`
4. **Test app**: http://localhost:3001

**That's it! Your Outsourcing OS will be fully set up and ready to use!** 🚀

---

## 📞 Need Help?

If you get stuck at any step, tell me:
1. Which step you're on
2. What error message you see (if any)
3. Screenshot of the error (if possible)

I'll help you fix it immediately! 💪
