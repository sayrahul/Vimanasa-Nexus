# Google Sheets Setup for Outsourcing OS

## Overview
This guide will help you set up the Google Sheets structure for the Vimanasa Nexus Outsourcing OS.

---

## Required Sheets

### 1. **Clients Sheet** (NEW)

**Sheet Name:** `Clients`

**Columns (in exact order):**
```
Client ID | Client Name | GST Number | Location | Contact Person | Contact Phone | Contact Email | Payment Terms | Contract Start | Contract End | Agency Margin % | Margin Type | Manages Leaves | Status | Deployed Staff
```

**Sample Data:**
```
CLI001 | Zilla Parishad IT Department | 27AABCU9603R1ZM | Pune, Maharashtra | Mr. Rajesh Kumar | +91 98765 43210 | rajesh@zp.gov.in | Net 30 | 2026-01-01 | 2027-01-01 | 8.5 | Percentage | No | Active | 0

CLI002 | Tech Corp India | 27AABCU9603R1ZN | Mumbai, Maharashtra | Ms. Priya Sharma | +91 98765 43211 | priya@techcorp.com | Net 45 | 2026-02-01 | 2027-02-01 | 10.0 | Percentage | Yes | Active | 0
```

---

### 2. **Employees Sheet** (UPDATED)

**Sheet Name:** `Employees`

**New Columns to Add (append to existing columns):**
```
[Existing columns] + Deployment Status | Assigned Client | Deployment Date | Site Location | Shift Start | Shift End | Phone | Email | Aadhar | PAN | Basic Salary | HRA | Allowances | Total Pay Rate | Employer PF | Employer ESIC | Agency Commission | Total Bill Rate | GST Amount | Final Invoice Amount
```

**Complete Column List:**
```
ID | Employee | Role | Status | Deployment Status | Assigned Client | Deployment Date | Site Location | Shift Start | Shift End | Phone | Email | Aadhar | PAN | Basic Salary | HRA | Allowances | Total Pay Rate | Employer PF | Employer ESIC | Agency Commission | Total Bill Rate | GST Amount | Final Invoice Amount
```

**Sample Data:**
```
EMP001 | Rajesh Kumar | Security Guard | Active | Deployed | Zilla Parishad IT Department | 2026-01-15 | Pune Office - Gate 2 | 09:00 | 18:00 | +91 98765 43210 | rajesh@example.com | 1234 5678 9012 | ABCDE1234F | 15000 | 5000 | 2000 | 22000 | 1800 | 715 | 2500 | 27015 | 4863 | 31878

EMP002 | Priya Sharma | Supervisor | Active | On Bench | | | | 09:00 | 18:00 | +91 98765 43211 | priya@example.com | 2345 6789 0123 | BCDEF2345G | 20000 | 7000 | 3000 | 30000 | 2400 | 975 | 3500 | 36875 | 6638 | 43513
```

**Important Notes:**
- **Deployment Status:** Can be "Deployed", "On Bench", or "Inactive"
- **Assigned Client:** Must match a client name from the Clients sheet (leave empty if "On Bench")
- **Pay Rate Fields** (Basic Salary, HRA, Allowances, Total Pay Rate): Visible to employees
- **Bill Rate Fields** (Employer PF, ESIC, Agency Commission, Total Bill Rate, GST, Final Invoice): Admin only - NEVER share with employees

---

### 3. **Client_Invoices Sheet** (NEW)

**Sheet Name:** `Client_Invoices`

**Columns (in exact order):**
```
Invoice Number | Client Name | Client ID | Month | Invoice Date | Due Date | Total Employees | Subtotal | GST Amount | Invoice Amount | Status | Payment Terms | Paid Date | Notes
```

**Sample Data:**
```
INV-001 | Zilla Parishad IT Department | CLI001 | 2026-01 | 2026-02-01 | 2026-03-03 | 5 | 350000 | 63000 | 413000 | Pending | Net 30 | | Monthly billing for January 2026

INV-002 | Tech Corp India | CLI002 | 2026-01 | 2026-02-01 | 2026-03-16 | 8 | 580000 | 104400 | 684400 | Sent | Net 45 | | Monthly billing for January 2026
```

**Status Values:**
- **Pending:** Invoice generated but not sent
- **Sent:** Invoice sent to client
- **Paid:** Payment received
- **Overdue:** Past due date and unpaid

---

### 4. **Existing Sheets** (Keep as is)

These sheets remain unchanged:
- **Dashboard**
- **Partners** (or rename to "Legacy_Partners" if you want to phase it out)
- **Payroll**
- **Finance**
- **Compliance**
- **Attendance**
- **Leave Requests**
- **Expense Claims**

---

## Step-by-Step Setup Instructions

### Step 1: Open Your Google Sheet
1. Go to your existing Vimanasa Nexus Google Sheet
2. Make sure you're logged in with the service account email

### Step 2: Create "Clients" Sheet
1. Click the **+** button at the bottom to add a new sheet
2. Rename it to exactly: `Clients`
3. In Row 1, add the column headers (copy from above)
4. Add at least 1-2 sample clients for testing

### Step 3: Update "Employees" Sheet
1. Go to your existing `Employees` sheet
2. Add the new columns to the right of existing columns
3. For existing employees, you can:
   - Set "Deployment Status" to "On Bench" initially
   - Leave deployment fields empty
   - Add salary information (Basic, HRA, Allowances)
   - Calculate Bill Rate fields using formulas (see below)

### Step 4: Create "Client_Invoices" Sheet
1. Click the **+** button to add another new sheet
2. Rename it to exactly: `Client_Invoices`
3. Add the column headers from above
4. Leave it empty initially (invoices will be generated from the app)

---

## Google Sheets Formulas (Optional)

### Auto-Calculate Total Pay Rate (in Employees sheet)
In column R (Total Pay Rate), use:
```
=O2+P2+Q2
```
Where O=Basic Salary, P=HRA, Q=Allowances

### Auto-Calculate Employer PF (12% of Basic)
In column S (Employer PF), use:
```
=O2*0.12
```

### Auto-Calculate Employer ESIC (3.25% of Gross)
In column T (Employer ESIC), use:
```
=R2*0.0325
```

### Auto-Calculate Total Bill Rate
In column V (Total Bill Rate), use:
```
=R2+S2+T2+U2
```
Where R=Total Pay Rate, S=Employer PF, T=Employer ESIC, U=Agency Commission

### Auto-Calculate GST (18%)
In column W (GST Amount), use:
```
=V2*0.18
```

### Auto-Calculate Final Invoice Amount
In column X (Final Invoice Amount), use:
```
=V2+W2
```

---

## Security & Access Control

### Important Security Notes:

1. **Bill Rate Columns are Confidential**
   - Columns S-X in Employees sheet contain sensitive pricing
   - NEVER share these with employees or sub-admins
   - Consider using Google Sheets' "Protected Ranges" feature

2. **Protect Sensitive Columns:**
   - Go to Data → Protected sheets and ranges
   - Select columns S through X in Employees sheet
   - Set permissions to "Only you can edit"

3. **Agency Margin % in Clients Sheet:**
   - Column K (Agency Margin %) is also confidential
   - Protect this column as well

---

## Verification Checklist

After setup, verify:

- [ ] "Clients" sheet exists with correct column headers
- [ ] "Employees" sheet has all new columns added
- [ ] "Client_Invoices" sheet exists with correct headers
- [ ] At least 1 sample client added
- [ ] At least 1 employee with complete salary data
- [ ] Formulas working correctly (if using)
- [ ] Sensitive columns protected
- [ ] Service account has edit access to all sheets

---

## Testing the Integration

1. **Test Client Creation:**
   - Go to app → Clients tab
   - Click "Add Client"
   - Fill in details and save
   - Verify it appears in Google Sheets

2. **Test Employee Deployment:**
   - Go to app → Workforce tab
   - Edit an employee
   - Set "Deployment Status" to "Deployed"
   - Select a client
   - Add salary information
   - Save and verify in Google Sheets

3. **Test Invoice Generation:**
   - Go to app → Invoices tab
   - Click "Generate Invoice"
   - Select a client and month
   - Generate and verify in Google Sheets

---

## Troubleshooting

### "Sheet not found" error:
- Verify sheet names are exactly: `Clients`, `Employees`, `Client_Invoices`
- Check for extra spaces or typos

### Data not saving:
- Verify service account has edit permissions
- Check column order matches exactly
- Look for console errors in browser

### Calculations not working:
- Verify all numeric fields contain numbers (not text)
- Check formula syntax if using Google Sheets formulas

---

## Next Steps

Once sheets are set up:
1. Add your real clients
2. Update employee records with deployment info
3. Start generating invoices
4. Monitor the Invoices tab for billing

---

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify Google Sheets API is enabled
3. Confirm service account permissions
4. Review the DEBUG_INSTRUCTIONS.md file

---

**Setup Complete!** 🎉

Your Vimanasa Nexus is now ready for multi-tenant outsourcing operations with automated client invoicing!
