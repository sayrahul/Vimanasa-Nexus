# Visual Step-by-Step Google Sheets Setup

## 🎯 Goal
Set up 2 new sheets and update 1 existing sheet in your Google Sheets.

**Your Sheet:** https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

**Time Required:** 15 minutes

---

## 📋 Part 1: Create "Clients" Sheet (5 minutes)

### Step 1: Add New Sheet
![Add Sheet](Look at the bottom of your Google Sheet)

1. See the tabs at the bottom? (Dashboard, Employees, etc.)
2. Click the **+** button (far left, next to the sheet tabs)
3. A new sheet appears called "Sheet1" or similar

### Step 2: Rename to "Clients"
1. Right-click on the new sheet tab
2. Click "Rename"
3. Type exactly: `Clients`
4. Press Enter

### Step 3: Add Headers
1. Click on cell **A1**
2. Copy this entire line (Ctrl+C):
```
Client ID	Client Name	GST Number	Location	Contact Person	Contact Phone	Contact Email	Payment Terms	Contract Start	Contract End	Agency Margin %	Margin Type	Manages Leaves	Status	Deployed Staff
```
3. Paste it (Ctrl+V) into cell A1
4. The headers will spread across columns A through O

### Step 4: Format Headers
1. Click on **Row 1** (click the number "1" on the left)
2. Click the **Bold** button (B) in the toolbar
3. Click the **Fill color** button (paint bucket icon)
4. Choose a **Blue** color
5. Click the **Text color** button (A with underline)
6. Choose **White**

### Step 5: Freeze Header Row
1. Click **View** in the menu
2. Click **Freeze**
3. Click **1 row**
4. Now row 1 stays visible when you scroll

### Step 6: Add Sample Client 1
1. Click on cell **A2**
2. Copy this entire line:
```
CLI001	Zilla Parishad IT Department	27AABCU9603R1ZM	Pune, Maharashtra	Mr. Rajesh Kumar	+91 98765 43210	rajesh@zp.gov.in	Net 30	2026-01-01	2027-01-01	8.5	Percentage	No	Active	0
```
3. Paste it into cell A2

### Step 7: Add Sample Client 2
1. Click on cell **A3**
2. Copy this entire line:
```
CLI002	Tech Corp India	27AABCU9603R1ZN	Mumbai, Maharashtra	Ms. Priya Sharma	+91 98765 43211	priya@techcorp.com	Net 45	2026-02-01	2027-02-01	10.0	Percentage	Yes	Active	0
```
3. Paste it into cell A3

### ✅ Clients Sheet Complete!
You should now see:
- Row 1: Blue header with white text (15 columns)
- Row 2: Zilla Parishad IT Department
- Row 3: Tech Corp India

---

## 📋 Part 2: Create "Client_Invoices" Sheet (3 minutes)

### Step 1: Add New Sheet
1. Click the **+** button at the bottom again
2. A new sheet appears

### Step 2: Rename to "Client_Invoices"
1. Right-click on the new sheet tab
2. Click "Rename"
3. Type exactly: `Client_Invoices`
4. Press Enter

### Step 3: Add Headers
1. Click on cell **A1**
2. Copy this entire line:
```
Invoice Number	Client Name	Client ID	Month	Invoice Date	Due Date	Total Employees	Subtotal	GST Amount	Invoice Amount	Status	Payment Terms	Paid Date	Notes
```
3. Paste it into cell A1
4. The headers will spread across columns A through N

### Step 4: Format Headers
1. Click on **Row 1**
2. Make it **Bold**
3. Fill color: **Blue**
4. Text color: **White**
5. **View** → **Freeze** → **1 row**

### Step 5: Leave Empty
- Don't add any data rows
- Invoices will be generated from the app

### ✅ Client_Invoices Sheet Complete!
You should now see:
- Row 1: Blue header with white text (14 columns)
- Rows 2+: Empty (ready for invoices)

---

## 📋 Part 3: Update "Employees" Sheet (7 minutes)

### Step 1: Find Employees Sheet
1. Look at the sheet tabs at the bottom
2. Click on the **Employees** sheet
3. If you don't have one, create it first

### Step 2: Find Last Column
1. Scroll right to find the last column with data
2. Let's say your last column is "Status" in column D
3. Click on cell **E1** (the next empty column)

### Step 3: Add New Headers
1. Click on the first empty cell in Row 1
2. Copy this entire line:
```
Deployment Status	Assigned Client	Deployment Date	Site Location	Shift Start	Shift End	Phone	Email	Aadhar	PAN	Basic Salary	HRA	Allowances	Total Pay Rate	Employer PF	Employer ESIC	Agency Commission	Total Bill Rate	GST Amount	Final Invoice Amount
```
3. Paste it
4. The new headers will spread across 20 columns

### Step 4: Format New Headers
1. Select all the new header cells (the ones you just added)
2. Make them **Bold**
3. Fill color: **Blue**
4. Text color: **White**

### Step 5: Add Sample Employee (Optional)
If you want to test, add this data in Row 2:

**Existing Columns:**
- ID: `EMP001`
- Employee: `Rajesh Kumar`
- Role: `Security Guard`
- Status: `Active`

**New Columns (in order):**
```
Deployed	Zilla Parishad IT Department	2026-01-15	Pune Office - Gate 2	09:00	18:00	+91 98765 43210	rajesh@example.com	1234 5678 9012	ABCDE1234F	15000	5000	2000	22000	1800	715	2500	27015	4863	31878
```

### ✅ Employees Sheet Complete!
You should now see:
- Original columns (ID, Employee, Role, Status, etc.)
- 20 new columns added to the right
- All headers formatted in blue

---

## 📋 Part 4: Grant Access to Service Account (2 minutes)

### Step 1: Click Share Button
1. Look at the top-right corner of your Google Sheet
2. Click the **Share** button (looks like a person with a +)

### Step 2: Add Service Account
1. In the "Add people and groups" field, paste this email:
```
rahul-mwsnoc@appspot.gserviceaccount.com
```
2. Press Enter or Tab

### Step 3: Set Permission
1. Click the dropdown next to the email
2. Select **Editor**
3. **Uncheck** "Notify people" (no need to send email)
4. Click **Share** or **Done**

### ✅ Access Granted!
The service account can now read and write to your sheet.

---

## 🧪 Part 5: Test the Setup (3 minutes)

### Step 1: Verify Sheet Names
Look at the tabs at the bottom. You should have:
- ✅ Clients
- ✅ Client_Invoices
- ✅ Employees (updated)
- Plus your existing sheets

### Step 2: Verify Headers
**Clients sheet:**
- Row 1 should have 15 columns
- Starting with "Client ID" and ending with "Deployed Staff"

**Client_Invoices sheet:**
- Row 1 should have 14 columns
- Starting with "Invoice Number" and ending with "Notes"

**Employees sheet:**
- Should have your original columns PLUS 20 new columns
- New columns start with "Deployment Status" and end with "Final Invoice Amount"

### Step 3: Verify Sample Data
**Clients sheet:**
- Row 2: Zilla Parishad IT Department
- Row 3: Tech Corp India

**Client_Invoices sheet:**
- Empty (no data rows)

### Step 4: Verify Access
1. Click **Share** button
2. You should see: `rahul-mwsnoc@appspot.gserviceaccount.com` with **Editor** access

---

## 🚀 Part 6: Test the App

### Step 1: Start the App
Open terminal and run:
```bash
npm run dev
```

Wait for: `✓ Ready in X.Xs`

### Step 2: Open in Browser
Go to: http://localhost:3001

### Step 3: Login
- Username: `admin`
- Password: `Vimanasa@2026`

### Step 4: Test Clients Tab
1. Click **Clients** in the sidebar
2. You should see 2 client cards:
   - Zilla Parishad IT Department
   - Tech Corp India
3. Click **Add Client** to test adding a new one

### Step 5: Test Workforce Tab
1. Click **Workforce** in the sidebar
2. Click **Add Entry**
3. Fill in the form:
   - Name: Test Employee
   - Role: Security Guard
   - Deployment Status: **Deployed**
   - Assigned Client: Select "Zilla Parishad IT Department"
   - Basic Salary: 15000
   - HRA: 5000
   - Allowances: 2000
   - Agency Commission: 2500
4. Watch the **Bill Rate** auto-calculate!
5. Click **Add Employee**
6. Check your Google Sheet - new employee should appear

### Step 6: Test Invoices Tab
1. Click **Invoices** in the sidebar
2. Click **Generate Invoice**
3. Select:
   - Client: Zilla Parishad IT Department
   - Month: Current month
   - Due Date: 30 days from now
4. Review the preview
5. Click **Generate Invoice**
6. Click **Download** to get the PDF
7. Check your Google Sheet - invoice should appear in Client_Invoices sheet

---

## ✅ Success Checklist

Mark each item as you complete it:

**Google Sheets Setup:**
- [ ] Clients sheet created with blue headers
- [ ] 2 sample clients added (Zilla Parishad, Tech Corp)
- [ ] Client_Invoices sheet created with blue headers
- [ ] Client_Invoices sheet is empty (ready for invoices)
- [ ] Employees sheet has 20 new columns added
- [ ] All new headers are formatted (blue background, white text)
- [ ] Service account has Editor access

**App Testing:**
- [ ] App starts without errors
- [ ] Can login successfully
- [ ] Clients tab shows 2 sample clients
- [ ] Can add a new client
- [ ] Workforce tab loads
- [ ] Can add/edit employee with deployment
- [ ] Bill Rate auto-calculates correctly
- [ ] Invoices tab loads
- [ ] Can generate an invoice
- [ ] Invoice PDF downloads
- [ ] Data syncs to Google Sheets

---

## 🐛 Common Issues & Solutions

### Issue: "Sheet not found" error
**Solution:**
- Check sheet names are EXACTLY: `Clients`, `Client_Invoices`, `Employees`
- No extra spaces, correct capitalization
- No special characters

### Issue: Data not saving to Google Sheets
**Solution:**
1. Verify service account email is in the Share list
2. Verify it has **Editor** permission (not Viewer)
3. Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue: Headers not matching
**Solution:**
- Copy-paste the headers exactly as shown
- Don't rearrange columns
- Don't skip columns
- Use Tab-separated format (not comma)

### Issue: Bill Rate not calculating
**Solution:**
- Make sure you're logged in as admin
- Enter numbers (not text) in salary fields
- Check that all required fields are filled

### Issue: Can't see new sheets in app
**Solution:**
1. Hard refresh browser: Ctrl+Shift+R
2. Clear browser cache
3. Check browser console (F12) for errors
4. Restart dev server

---

## 📞 Need Help?

**Check These Files:**
- `MANUAL_SHEETS_SETUP.md` - Text-based setup guide
- `COMPLETE_WORKFLOW_DETAILED.md` - How the system works
- `QUICK_START_OUTSOURCING.md` - Quick start guide
- `DEBUG_INSTRUCTIONS.md` - Troubleshooting

**Your Google Sheet:**
https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

**Service Account Email:**
rahul-mwsnoc@appspot.gserviceaccount.com

---

## 🎉 You're Done!

Once all checkboxes are marked, your Outsourcing OS is fully set up and ready to use!

**What You Can Do Now:**
1. ✅ Manage multiple clients
2. ✅ Deploy employees to clients
3. ✅ Track dual-salary (Pay Rate vs Bill Rate)
4. ✅ Generate automated invoices
5. ✅ Download professional PDFs
6. ✅ Track profitability

**Next Steps:**
1. Add your real clients
2. Update your employees with deployment info
3. Generate your first real invoice
4. Start tracking your profits!

**Welcome to your new Outsourcing OS!** 🚀
