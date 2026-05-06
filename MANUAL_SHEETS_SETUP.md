# Manual Google Sheets Setup Guide

## Quick Setup (15 minutes)

Your Google Sheet ID: `1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM`

**Open your sheet:** https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

---

## Step 1: Create "Clients" Sheet

### 1.1 Add New Sheet
1. Click the **+** button at the bottom left
2. Rename the new sheet to exactly: `Clients`

### 1.2 Add Headers (Row 1)
Copy and paste this into Row 1, starting from cell A1:

```
Client ID	Client Name	GST Number	Location	Contact Person	Contact Phone	Contact Email	Payment Terms	Contract Start	Contract End	Agency Margin %	Margin Type	Manages Leaves	Status	Deployed Staff
```

### 1.3 Add Sample Data (Row 2)
Copy and paste this into Row 2:

```
CLI001	Zilla Parishad IT Department	27AABCU9603R1ZM	Pune, Maharashtra	Mr. Rajesh Kumar	+91 98765 43210	rajesh@zp.gov.in	Net 30	2026-01-01	2027-01-01	8.5	Percentage	No	Active	0
```

### 1.4 Add Sample Data (Row 3)
Copy and paste this into Row 3:

```
CLI002	Tech Corp India	27AABCU9603R1ZN	Mumbai, Maharashtra	Ms. Priya Sharma	+91 98765 43211	priya@techcorp.com	Net 45	2026-02-01	2027-02-01	10.0	Percentage	Yes	Active	0
```

### 1.5 Format Headers
1. Select Row 1 (the header row)
2. Make it **Bold**
3. Change background color to **Blue**
4. Change text color to **White**
5. Click **View** → **Freeze** → **1 row**

---

## Step 2: Create "Client_Invoices" Sheet

### 2.1 Add New Sheet
1. Click the **+** button at the bottom left
2. Rename the new sheet to exactly: `Client_Invoices`

### 2.2 Add Headers (Row 1)
Copy and paste this into Row 1, starting from cell A1:

```
Invoice Number	Client Name	Client ID	Month	Invoice Date	Due Date	Total Employees	Subtotal	GST Amount	Invoice Amount	Status	Payment Terms	Paid Date	Notes
```

### 2.3 Format Headers
1. Select Row 1
2. Make it **Bold**
3. Change background color to **Blue**
4. Change text color to **White**
5. Click **View** → **Freeze** → **1 row**

**Note:** Leave this sheet empty. Invoices will be generated from the app.

---

## Step 3: Update "Employees" Sheet

### 3.1 Find Your Employees Sheet
- Look for your existing sheet named "Employees" (or similar)
- If it doesn't exist, create it first

### 3.2 Add New Columns
Go to the **last column** of your Employees sheet and add these 20 new columns:

**Copy and paste these headers to the right of your existing columns:**

```
Deployment Status	Assigned Client	Deployment Date	Site Location	Shift Start	Shift End	Phone	Email	Aadhar	PAN	Basic Salary	HRA	Allowances	Total Pay Rate	Employer PF	Employer ESIC	Agency Commission	Total Bill Rate	GST Amount	Final Invoice Amount
```

### 3.3 Format New Headers
1. Select the new header cells
2. Make them **Bold**
3. Change background color to **Blue**
4. Change text color to **White**

### 3.4 Add Sample Employee (Optional)
If you want to test, add this sample employee data:

**Basic Info (existing columns):**
```
ID: EMP001
Employee: Rajesh Kumar
Role: Security Guard
Status: Active
```

**New Deployment Columns:**
```
Deployment Status: Deployed
Assigned Client: Zilla Parishad IT Department
Deployment Date: 2026-01-15
Site Location: Pune Office - Gate 2
Shift Start: 09:00
Shift End: 18:00
Phone: +91 98765 43210
Email: rajesh@example.com
Aadhar: 1234 5678 9012
PAN: ABCDE1234F
Basic Salary: 15000
HRA: 5000
Allowances: 2000
Total Pay Rate: 22000
Employer PF: 1800
Employer ESIC: 715
Agency Commission: 2500
Total Bill Rate: 27015
GST Amount: 4863
Final Invoice Amount: 31878
```

---

## Step 4: Grant Service Account Access

### 4.1 Share the Sheet
1. Click the **Share** button (top right)
2. Add this email: `rahul-mwsnoc@appspot.gserviceaccount.com`
3. Give it **Editor** access
4. Click **Send**

**Important:** This allows the app to read and write data to your sheet.

---

## Step 5: Verify Setup

### 5.1 Check Sheet Names
Make sure you have these sheets with **exact names**:
- ✅ `Clients`
- ✅ `Client_Invoices`
- ✅ `Employees` (updated with new columns)

### 5.2 Check Headers
- ✅ Clients sheet has 15 columns
- ✅ Client_Invoices sheet has 14 columns
- ✅ Employees sheet has original columns + 20 new columns

### 5.3 Check Sample Data
- ✅ Clients sheet has 2 sample clients
- ✅ Client_Invoices sheet is empty
- ✅ Employees sheet has at least 1 employee (optional)

---

## Step 6: Test the App

### 6.1 Start the App
```bash
npm run dev
```

### 6.2 Login
- URL: http://localhost:3001
- Username: `admin`
- Password: `Vimanasa@2026`

### 6.3 Test Clients Tab
1. Go to **Clients** tab
2. You should see the 2 sample clients
3. Try clicking "Add Client" to add a new one

### 6.4 Test Workforce Tab
1. Go to **Workforce** tab
2. Click "Add Entry"
3. Fill in employee details
4. Set "Deployment Status" to "Deployed"
5. Select a client
6. Add salary information
7. Watch the Bill Rate auto-calculate!
8. Save

### 6.5 Test Invoices Tab
1. Go to **Invoices** tab
2. Click "Generate Invoice"
3. Select a client
4. Select month
5. Review preview
6. Generate invoice
7. Download PDF

---

## Troubleshooting

### "Sheet not found" error
- **Solution:** Check sheet names are exactly: `Clients`, `Client_Invoices`, `Employees`
- No extra spaces, correct capitalization

### Data not saving
- **Solution:** Verify service account has Editor access
- Check: rahul-mwsnoc@appspot.gserviceaccount.com is in the share list

### Columns not matching
- **Solution:** Verify column order matches exactly
- Headers must be in the exact order shown above

### App not loading data
- **Solution:** 
  1. Check browser console (F12) for errors
  2. Verify .env.local has correct SPREADSHEET_ID
  3. Restart the dev server: `npm run dev`

---

## Quick Copy-Paste Reference

### Clients Headers (15 columns):
```
Client ID	Client Name	GST Number	Location	Contact Person	Contact Phone	Contact Email	Payment Terms	Contract Start	Contract End	Agency Margin %	Margin Type	Manages Leaves	Status	Deployed Staff
```

### Client_Invoices Headers (14 columns):
```
Invoice Number	Client Name	Client ID	Month	Invoice Date	Due Date	Total Employees	Subtotal	GST Amount	Invoice Amount	Status	Payment Terms	Paid Date	Notes
```

### Employees New Columns (20 columns):
```
Deployment Status	Assigned Client	Deployment Date	Site Location	Shift Start	Shift End	Phone	Email	Aadhar	PAN	Basic Salary	HRA	Allowances	Total Pay Rate	Employer PF	Employer ESIC	Agency Commission	Total Bill Rate	GST Amount	Final Invoice Amount
```

---

## Visual Guide

### Your Sheet Structure Should Look Like:

```
📊 Your Google Sheet
├── 📄 Dashboard (existing)
├── 📄 Employees (updated with 20 new columns)
├── 📄 Clients (NEW - 15 columns, 2 sample rows)
├── 📄 Partners (existing)
├── 📄 Payroll (existing)
├── 📄 Finance (existing)
├── 📄 Compliance (existing)
├── 📄 Attendance (existing)
├── 📄 Leave Requests (existing)
├── 📄 Expense Claims (existing)
└── 📄 Client_Invoices (NEW - 14 columns, empty)
```

---

## Success Checklist

- [ ] Clients sheet created with headers
- [ ] 2 sample clients added
- [ ] Client_Invoices sheet created with headers
- [ ] Employees sheet updated with 20 new columns
- [ ] Service account granted Editor access
- [ ] App tested and loading data
- [ ] Can add new client
- [ ] Can deploy employee
- [ ] Can generate invoice

---

## Next Steps

Once setup is complete:

1. **Add Your Real Clients**
   - Go to Clients tab in app
   - Click "Add Client"
   - Fill in details
   - Set agency margin %

2. **Update Your Employees**
   - Go to Workforce tab
   - Edit each employee
   - Set deployment status
   - Add salary information
   - Add bill rate information

3. **Generate Your First Invoice**
   - Go to Invoices tab
   - Click "Generate Invoice"
   - Select client and month
   - Download PDF

4. **Track Profitability**
   - Monitor your margins
   - Track on-bench costs
   - Optimize pricing

---

## Support

**Need Help?**
- Check console for errors (F12 in browser)
- Review DEBUG_INSTRUCTIONS.md
- Check COMPLETE_WORKFLOW_DETAILED.md for workflows

**Sheet URL:**
https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

---

**Setup Time:** ~15 minutes  
**Difficulty:** Easy (copy-paste)  
**Result:** Fully functional Outsourcing OS! 🎉
