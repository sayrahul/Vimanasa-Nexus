# 🚀 Quick Start Guide - Outsourcing OS

## Your App is Ready!

**Access URL:** http://localhost:3001

**Login Credentials:**
- Username: `admin`
- Password: `Vimanasa@2026`

---

## ✅ What's New

### New Menu Items:
1. **Clients** - Manage your outsourcing clients
2. **Invoices** - Generate and track client invoices

### Enhanced Features:
- **Workforce** - Now includes deployment tracking and dual-salary structure
- **Dashboard** - Ready for profitability metrics

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Set Up Google Sheets (2 minutes)

Open your Google Sheet and add these 3 new sheets:

#### Sheet 1: "Clients"
**Columns:**
```
Client ID | Client Name | GST Number | Location | Contact Person | Contact Phone | Contact Email | Payment Terms | Contract Start | Contract End | Agency Margin % | Margin Type | Manages Leaves | Status | Deployed Staff
```

**Sample Row:**
```
CLI001 | Zilla Parishad IT | 27AABCU9603R1ZM | Pune | Mr. Rajesh | +91 98765 43210 | rajesh@zp.gov.in | Net 30 | 2026-01-01 | 2027-01-01 | 8.5 | Percentage | No | Active | 0
```

#### Sheet 2: Update "Employees" 
**Add these columns to the right:**
```
Deployment Status | Assigned Client | Deployment Date | Site Location | Shift Start | Shift End | Phone | Email | Aadhar | PAN | Basic Salary | HRA | Allowances | Total Pay Rate | Employer PF | Employer ESIC | Agency Commission | Total Bill Rate | GST Amount | Final Invoice Amount
```

#### Sheet 3: "Client_Invoices"
**Columns:**
```
Invoice Number | Client Name | Client ID | Month | Invoice Date | Due Date | Total Employees | Subtotal | GST Amount | Invoice Amount | Status | Payment Terms | Paid Date | Notes
```

### Step 2: Test the App (3 minutes)

1. **Login** at http://localhost:3001
2. **Go to Clients tab** → Click "Add Client"
3. **Fill in client details:**
   - Name: Test Client
   - Location: Pune
   - Agency Margin %: 8.5
   - Save
4. **Go to Workforce tab** → Edit an employee
5. **Set deployment:**
   - Deployment Status: Deployed
   - Assigned Client: Test Client
   - Basic Salary: 15000
   - HRA: 5000
   - Allowances: 2000
   - Agency Commission: 2500
   - Save (watch the Bill Rate auto-calculate!)
6. **Go to Invoices tab** → Click "Generate Invoice"
7. **Select client and month** → Generate
8. **Download PDF** → See your professional invoice!

---

## 💡 Key Features

### 1. Dual-Salary Structure
**What Employee Sees (Pay Rate):**
- Basic: ₹15,000
- HRA: ₹5,000
- Allowances: ₹2,000
- **Total: ₹22,000**

**What Client Pays (Bill Rate - Hidden from Employee):**
- Pay Rate: ₹22,000
- Employer PF: ₹1,800
- Employer ESIC: ₹715
- Agency Commission: ₹2,500
- **Subtotal: ₹27,015**
- GST (18%): ₹4,863
- **Final: ₹31,878**

**Your Profit: ₹7,363 per employee per month!**

### 2. Deployment Tracking
- **On Bench:** Employee not assigned (costing you money)
- **Deployed:** Employee assigned to client (generating revenue)
- **Inactive:** Employee not working

### 3. Automated Invoicing
- Select client + month
- System calculates from deployed employees
- Generates professional PDF
- Tracks payment status

---

## 📊 Navigation

```
Dashboard          → Overview and stats
Workforce          → Employees with deployment (ENHANCED)
Clients            → Client management (NEW)
Partners           → Legacy partners
Attendance         → Daily attendance
Leave              → Leave management
Expenses           → Expense claims
Payroll            → Salary processing
Finance            → Revenue & expenses
Compliance         → Statutory filings
Invoices           → Client billing (NEW)
```

---

## 🔐 Security

### Bill Rate is Hidden!
- Only visible to Super Admin
- Red background with warning
- Never share with employees or sub-admins

### Agency Margin is Confidential!
- Set per client
- Hidden from employees
- Your competitive advantage

---

## 📝 Typical Workflow

### Adding a New Client:
1. Clients → Add Client
2. Fill details + set agency margin %
3. Save

### Deploying an Employee:
1. Workforce → Edit employee
2. Set "Deployed" status
3. Select client
4. Add salary info
5. Add agency commission
6. Save (Bill Rate auto-calculates)

### Generating Monthly Invoice:
1. Invoices → Generate Invoice
2. Select client + month
3. Review preview
4. Generate
5. Download PDF
6. Send to client

### Tracking Payments:
1. Invoices → View all invoices
2. Filter by month
3. Update status when paid
4. Monitor profitability

---

## 🎨 Color Coding

- **Green Section:** Pay Rate (employee can see)
- **Red Section:** Bill Rate (admin only)
- **Blue Headers:** Client information
- **Status Badges:**
  - Green: Active/Paid/Completed
  - Blue: In Progress/Sent
  - Amber: Pending
  - Red: Overdue/Inactive

---

## 🐛 Troubleshooting

### Can't see new tabs?
- Refresh browser (Ctrl+R)
- Clear cache (Ctrl+Shift+R)

### Data not saving?
- Check Google Sheets sheet names
- Verify column order
- Check service account permissions

### Bill Rate not calculating?
- Ensure all fields have numbers
- Check you're logged in as admin
- Verify formulas in component

### Invoice not generating?
- Ensure client has deployed employees
- Check employees have salary data
- Verify Client_Invoices sheet exists

---

## 📚 Documentation

**Detailed Guides:**
- `IMPLEMENTATION_COMPLETE.md` - Full feature overview
- `GOOGLE_SHEETS_SETUP_OUTSOURCING.md` - Detailed sheets setup
- `OUTSOURCING_OS_TRANSFORMATION.md` - Complete roadmap
- `DEBUG_INSTRUCTIONS.md` - Troubleshooting

---

## 🎯 Success Checklist

- [ ] Google Sheets set up with 3 new sheets
- [ ] At least 1 client added
- [ ] At least 1 employee deployed with salary
- [ ] First invoice generated successfully
- [ ] PDF downloaded and reviewed
- [ ] Calculations verified

---

## 💰 Example Profit Calculation

**Scenario: 10 Security Guards at Zilla Parishad**

**Monthly Costs:**
- Salaries (10 × ₹22,000): ₹2,20,000
- Employer PF (10 × ₹1,800): ₹18,000
- Employer ESIC (10 × ₹715): ₹7,150
- **Total Cost: ₹2,45,150**

**Monthly Revenue:**
- Client Invoice (10 × ₹31,878): ₹3,18,780

**Monthly Profit:**
- Revenue - Cost: ₹73,630
- **Profit Margin: 23%**

**Annual Profit (from this one client):**
- ₹73,630 × 12 = **₹8,83,560**

---

## 🚀 Next Steps

1. **Today:** Set up Google Sheets
2. **This Week:** Add all clients and update employees
3. **Month End:** Generate first real invoices
4. **Next Month:** Track payments and profitability

---

## 🎉 You're All Set!

Your Outsourcing OS is ready to:
- ✅ Manage multiple clients
- ✅ Track employee deployments
- ✅ Hide profit margins from employees
- ✅ Generate professional invoices
- ✅ Calculate GST automatically
- ✅ Track profitability

**Start at:** http://localhost:3001

**Questions?** Check the documentation files or console (F12) for errors.

---

**Built for Vimanasa Services LLP** 🚀

*From HRMS to Outsourcing OS in one day!*
