# 📋 Copy-Paste Setup Guide (5 Minutes)

## Your Google Sheet
**Open this link:** https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

---

## Step 1: Create "Clients" Sheet (2 minutes)

### 1.1 Create Sheet
- Click **+** button at bottom
- Right-click new sheet → Rename → Type: `Clients`

### 1.2 Copy Headers
Select cell **A1**, then copy-paste this (press Ctrl+C to copy, Ctrl+V to paste):

```
Client ID	Client Name	GST Number	Location	Contact Person	Contact Phone	Contact Email	Payment Terms	Contract Start	Contract End	Agency Margin %	Margin Type	Manages Leaves	Status	Deployed Staff
```

### 1.3 Copy Sample Client 1
Select cell **A2**, then copy-paste this:

```
CLI001	Zilla Parishad IT Department	27AABCU9603R1ZM	Pune, Maharashtra	Mr. Rajesh Kumar	+91 98765 43210	rajesh@zp.gov.in	Net 30	2026-01-01	2027-01-01	8.5	Percentage	No	Active	0
```

### 1.4 Copy Sample Client 2
Select cell **A3**, then copy-paste this:

```
CLI002	Tech Corp India	27AABCU9603R1ZN	Mumbai, Maharashtra	Ms. Priya Sharma	+91 98765 43211	priya@techcorp.com	Net 45	2026-02-01	2027-02-01	10.0	Percentage	Yes	Active	0
```

### 1.5 Format
- Select Row 1
- Make **Bold** (Ctrl+B)
- Background: **Blue**
- Text: **White**

---

## Step 2: Create "Client_Invoices" Sheet (1 minute)

### 2.1 Create Sheet
- Click **+** button at bottom
- Right-click new sheet → Rename → Type: `Client_Invoices`

### 2.2 Copy Headers
Select cell **A1**, then copy-paste this:

```
Invoice Number	Client Name	Client ID	Month	Invoice Date	Due Date	Total Employees	Subtotal	GST Amount	Invoice Amount	Status	Payment Terms	Paid Date	Notes
```

### 2.3 Format
- Select Row 1
- Make **Bold** (Ctrl+B)
- Background: **Blue**
- Text: **White**

**Leave empty** - invoices will be generated from app

---

## Step 3: Update "Employees" Sheet (2 minutes)

### 3.1 Go to Employees Sheet
- Click on your **Employees** sheet tab

### 3.2 Find Last Column
- Scroll right to find the last column with data
- Click on the **next empty cell in Row 1**

### 3.3 Copy New Headers
Paste these 20 new headers:

```
Deployment Status	Assigned Client	Deployment Date	Site Location	Shift Start	Shift End	Phone	Email	Aadhar	PAN	Basic Salary	HRA	Allowances	Total Pay Rate	Employer PF	Employer ESIC	Agency Commission	Total Bill Rate	GST Amount	Final Invoice Amount
```

### 3.4 Format
- Select the new header cells
- Make **Bold** (Ctrl+B)
- Background: **Blue**
- Text: **White**

---

## Step 4: Grant Access (30 seconds)

### 4.1 Share
- Click **Share** button (top right)
- Add this email: `rahul-mwsnoc@appspot.gserviceaccount.com`
- Permission: **Editor**
- Uncheck "Notify people"
- Click **Share**

---

## ✅ Done! Test the App

### Open App
http://localhost:3001

### Login
- Username: `admin`
- Password: `Vimanasa@2026`

### Check Clients Tab
- Click **Clients** in sidebar
- You should see 2 clients!

### Try Adding Employee
- Click **Workforce**
- Click **Add Entry**
- Fill form and deploy to a client
- Watch Bill Rate auto-calculate!

---

## 🎉 Success!

You now have:
- ✅ Client management
- ✅ Dual-salary structure
- ✅ Automated invoicing
- ✅ Professional PDFs

**Total Time:** 5 minutes  
**Difficulty:** Copy-paste only!

---

## Need Help?

**Can't find the + button?**
- Look at the very bottom of your Google Sheet
- It's to the left of all the sheet tabs

**Headers not spreading across columns?**
- Make sure you're copying the TAB-separated text
- Don't type it manually

**App not showing clients?**
- Hard refresh: Ctrl+Shift+R
- Check service account has Editor access
- Restart dev server if needed

---

**Your Sheet:** https://docs.google.com/spreadsheets/d/1rqqMJDLreg8GloJfAT_er6pvB0KhYDSI6GmSg3k2eGM/edit

**Service Account:** rahul-mwsnoc@appspot.gserviceaccount.com

**App:** http://localhost:3001
