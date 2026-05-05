# 📊 Google Sheets Setup Guide

## Current Status

Your application is trying to fetch data from 3 sheets that don't exist yet:
1. **Attendance** ❌
2. **Leave Requests** ❌
3. **Expense Claims** ❌

The API has been updated to handle missing sheets gracefully (returns empty array instead of error), but for full functionality, you should create these sheets.

---

## 🔧 Quick Fix Applied

**What Changed:**
- API now returns empty array `[]` when a sheet doesn't exist
- No more 500 errors for missing sheets
- Application will work, but these features will show "No records found"

**Result:**
- ✅ Application loads without errors
- ✅ Dashboard, Workforce, Partners work normally
- ⚠️ Attendance, Leave, Expenses show empty (until sheets are created)

---

## 📋 Option 1: Create Sheets Manually (Recommended)

### Step 1: Open Your Google Spreadsheet
URL: https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

### Step 2: Create "Attendance" Sheet

1. Click the **+** button at the bottom to add a new sheet
2. Name it: **Attendance**
3. Add these column headers in Row 1:

```
Date | Employee ID | Employee Name | Status | Marked By | Marked At
```

**Example Data:**
```
2026-05-05 | EMP001 | John Doe | Present | Admin | 2026-05-05 09:00:00
2026-05-05 | EMP002 | Jane Smith | Absent | Admin | 2026-05-05 09:00:00
```

---

### Step 3: Create "Leave Requests" Sheet

1. Click the **+** button to add another sheet
2. Name it: **Leave Requests**
3. Add these column headers in Row 1:

```
Request ID | Employee ID | Employee Name | Leave Type | Start Date | End Date | Days | Reason | Status | Applied On | Approved By | Approved On
```

**Example Data:**
```
LR001 | EMP001 | John Doe | Sick Leave | 2026-05-10 | 2026-05-12 | 3 | Medical appointment | Pending | 2026-05-05 | | 
```

**Leave Types:**
- Sick Leave
- Casual Leave
- Earned Leave
- Maternity Leave
- Paternity Leave
- Unpaid Leave

**Status Values:**
- Pending
- Approved
- Rejected

---

### Step 4: Create "Expense Claims" Sheet

1. Click the **+** button to add another sheet
2. Name it: **Expense Claims**
3. Add these column headers in Row 1:

```
Claim ID | Employee ID | Employee Name | Category | Amount | Date | Description | Receipt URL | Status | Submitted On | Manager Status | Finance Status | Approved By | Approved On | Paid On
```

**Example Data:**
```
EXP001 | EMP001 | John Doe | Travel | 5000 | 2026-05-05 | Client visit to Mumbai | https://example.com/receipt.jpg | Pending | 2026-05-05 | Pending | Pending | | | 
```

**Expense Categories:**
- Travel
- Food & Accommodation
- Office Supplies
- Training & Development
- Communication
- Medical
- Fuel
- Other

**Status Values:**
- Pending
- Approved
- Rejected
- Paid

---

## 📋 Option 2: Use Google Sheets API to Create Sheets

If you prefer automation, I can create a script to automatically create these sheets with proper headers.

Would you like me to create a setup script?

---

## ✅ Verification Steps

After creating the sheets:

1. **Refresh the application**: http://localhost:3001
2. **Navigate to Attendance tab**: Should show empty table (not error)
3. **Navigate to Leave tab**: Should show empty table (not error)
4. **Navigate to Expenses tab**: Should show empty table (not error)
5. **Try adding a record**: Should save successfully

---

## 🎯 Current Sheet Status

### ✅ Existing Sheets (Working):
- Dashboard
- Employees (mapped to "Workforce")
- Clients (mapped to "Partners")
- Payroll
- Finance
- Compliance

### ❌ Missing Sheets (Need to Create):
- Attendance
- Leave Requests
- Expense Claims

---

## 🔍 How to Check Your Sheets

1. Open: https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit
2. Look at the tabs at the bottom
3. You should see: Dashboard, Employees, Clients, Payroll, Finance, Compliance
4. You need to add: Attendance, Leave Requests, Expense Claims

---

## 💡 Pro Tips

### Sheet Naming:
- ✅ Use exact names: "Attendance", "Leave Requests", "Expense Claims"
- ❌ Don't use: "attendance", "Leave_Requests", "ExpenseClaims"
- Spaces are OK, case matters!

### Column Headers:
- ✅ Use exact column names as shown above
- ❌ Don't change column order or names
- The application expects these exact headers

### Data Format:
- **Dates**: YYYY-MM-DD (e.g., 2026-05-05)
- **Times**: YYYY-MM-DD HH:MM:SS (e.g., 2026-05-05 09:00:00)
- **Numbers**: Plain numbers (e.g., 5000, not ₹5,000)
- **Status**: Exact match (Pending, Approved, Rejected)

---

## 🚨 Common Issues

### Issue 1: "Unable to parse range" error
**Cause**: Sheet name doesn't exist or has typo  
**Fix**: Check sheet name spelling and case

### Issue 2: Data not showing
**Cause**: Column headers don't match  
**Fix**: Use exact column names from this guide

### Issue 3: Can't save data
**Cause**: Service account doesn't have edit permission  
**Fix**: Share spreadsheet with: rahul-mwsnoc@appspot.gserviceaccount.com (Editor access)

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console (F12) for errors
2. Check terminal for server logs
3. Verify sheet names match exactly
4. Verify column headers match exactly
5. Verify service account has Editor access

---

## 🎉 After Setup

Once you create these 3 sheets, your application will have:

✅ **Full Attendance Management**
- Mark daily attendance
- View attendance history
- Export attendance reports

✅ **Full Leave Management**
- Submit leave requests
- Approve/reject leaves
- Track leave balance

✅ **Full Expense Management**
- Submit expense claims
- Approve/reject expenses
- Track expense reports

---

**Ready to create the sheets?** Follow the steps above and your application will be fully functional! 🚀

---

**Built with ❤️ for Vimanasa Services LLP**
