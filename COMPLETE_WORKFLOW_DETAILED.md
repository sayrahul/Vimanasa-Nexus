# Complete Application Workflow - Detailed Guide

## 📖 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Complete Workflows](#complete-workflows)
4. [Data Flow](#data-flow)
5. [Monthly Billing Cycle](#monthly-billing-cycle)
6. [Real-World Scenarios](#real-world-scenarios)

---

## System Overview

### What is Vimanasa Nexus?
A **multi-tenant outsourcing management system** that helps you:
- Manage multiple clients
- Deploy employees to client sites
- Track attendance and leaves
- Calculate dual-salary (what you pay vs what client pays)
- Generate automated invoices
- Track profitability

### Key Concept: Dual-Salary Structure
**The Core Innovation:**
- **Pay Rate:** What you pay the employee (₹22,000)
- **Bill Rate:** What client pays you (₹31,878)
- **Your Profit:** The difference (₹9,878)
- **Employee Never Knows:** They only see their Pay Rate

---

## User Roles & Permissions

### 1. Super Admin
**Who:** Business owner, Director

**Can Access:**
- ✅ Everything
- ✅ View Bill Rates (client pricing)
- ✅ View Agency Margins
- ✅ Profitability dashboard
- ✅ All financial data

**Cannot:**
- ❌ Nothing restricted

**Typical Tasks:**
- Set agency margins for clients
- Review profitability
- Approve major decisions
- Configure system settings

### 2. Sub-Admin / HR Manager
**Who:** HR team, Operations manager

**Can Access:**
- ✅ Add/edit employees
- ✅ Deploy employees to clients
- ✅ View Pay Rates (employee salaries)
- ✅ Manage attendance
- ✅ Approve leaves
- ✅ Generate payslips

**Cannot:**
- ❌ View Bill Rates (client pricing)
- ❌ View Agency Margins
- ❌ View profitability
- ❌ Generate invoices

**Typical Tasks:**
- Onboard new employees
- Deploy to client sites
- Manage daily operations
- Handle leave requests

### 3. Accountant
**Who:** Finance team

**Can Access:**
- ✅ Generate invoices
- ✅ Track payments
- ✅ View financial reports
- ✅ Manage compliance documents

**Cannot:**
- ❌ Add/edit employees
- ❌ Manage attendance
- ❌ Approve leaves

**Typical Tasks:**
- Generate monthly invoices
- Track client payments
- Upload PF/ESIC challans
- Financial reporting

### 4. Employee
**Who:** Security guards, supervisors, staff

**Can Access:**
- ✅ View own profile
- ✅ View Pay Rate (their salary)
- ✅ Mark attendance
- ✅ Apply for leave
- ✅ View payslips
- ✅ View attendance history

**Cannot:**
- ❌ View Bill Rate (what client pays)
- ❌ View other employees' data
- ❌ View client information
- ❌ View company financials

**Typical Tasks:**
- Mark daily attendance
- Apply for leaves
- Download payslips
- Update profile

### 5. Client (Portal Access)
**Who:** Client company representatives

**Can Access:**
- ✅ View deployed staff (to their company only)
- ✅ View attendance of their staff
- ✅ Approve monthly timesheets
- ✅ Download invoices
- ✅ View compliance documents

**Cannot:**
- ❌ View employee salaries
- ❌ View your profit margins
- ❌ View other clients' data
- ❌ Edit any data

**Typical Tasks:**
- Monitor staff attendance
- Approve monthly timesheets
- Download invoices
- Verify compliance

---

## Complete Workflows

### Workflow 1: Onboarding a New Client

**Scenario:** You win a contract with "Zilla Parishad IT Department" to provide 10 security guards.

**Step-by-Step:**

**Step 1: Login as Super Admin**
```
URL: http://localhost:3001
Username: admin
Password: Vimanasa@2026
```

**Step 2: Go to Clients Tab**
- Click "Clients" in sidebar
- Click "Add Client" button

**Step 3: Fill Client Details**
```
Basic Information:
- Client ID: CLI001 (auto-generated)
- Client Name: Zilla Parishad IT Department
- GST Number: 27AABCU9603R1ZM
- Location: Pune, Maharashtra

Contact Information:
- Contact Person: Mr. Rajesh Kumar
- Contact Phone: +91 98765 43210
- Contact Email: rajesh@zp.gov.in

Commercial Terms (CONFIDENTIAL):
- Payment Terms: Net 30
- Agency Margin %: 8.5
- Margin Type: Percentage
- Contract Start: 2026-01-01
- Contract End: 2027-01-01

Settings:
- Client Manages Leaves: No
- Status: Active
```

**Step 4: Save Client**
- Click "Add Client"
- Client is saved to Google Sheets "Clients" sheet
- Client card appears in Clients tab

**What Happens Behind the Scenes:**
```javascript
// Data sent to Google Sheets
{
  'Client ID': 'CLI001',
  'Client Name': 'Zilla Parishad IT Department',
  'GST Number': '27AABCU9603R1ZM',
  'Location': 'Pune, Maharashtra',
  'Contact Person': 'Mr. Rajesh Kumar',
  'Contact Phone': '+91 98765 43210',
  'Contact Email': 'rajesh@zp.gov.in',
  'Payment Terms': 'Net 30',
  'Contract Start': '2026-01-01',
  'Contract End': '2027-01-01',
  'Agency Margin %': '8.5',  // HIDDEN FROM EMPLOYEE
  'Margin Type': 'Percentage',
  'Manages Leaves': 'No',
  'Status': 'Active',
  'Deployed Staff': '0'
}
```

**Result:**
✅ Client added to system  
✅ Ready to deploy employees  
✅ Agency margin configured (8.5%)  

---

### Workflow 2: Deploying an Employee to Client

**Scenario:** Deploy Rajesh Kumar (security guard) to Zilla Parishad IT Department.

**Step-by-Step:**

**Step 1: Go to Workforce Tab**
- Click "Workforce" in sidebar
- Click "Add Entry" button (or edit existing employee)

**Step 2: Fill Basic Information**
```
Employee Details:
- Employee ID: EMP001 (auto-generated)
- Full Name: Rajesh Kumar
- Role: Security Guard
- Status: Active
- Phone: +91 98765 43210
- Email: rajesh@example.com
- Aadhar: 1234 5678 9012
- PAN: ABCDE1234F
```

**Step 3: Set Deployment Information**
```
Deployment:
- Deployment Status: Deployed (select from dropdown)
- Assigned Client: Zilla Parishad IT Department (select from dropdown)
- Deployment Date: 2026-01-15
- Site Location: Pune Office - Gate 2
- Shift Start: 09:00
- Shift End: 18:00
```

**Step 4: Enter Pay Rate (What You Pay Employee)**
```
Pay Rate (GREEN SECTION - Employee Can See):
- Basic Salary: 15000
- HRA: 5000
- Allowances: 2000
- Total Pay Rate: 22000 (auto-calculated)
```

**Step 5: Enter Agency Commission (Super Admin Only)**
```
Bill Rate (RED SECTION - ADMIN ONLY):
- Employer PF: 1800 (auto-calculated: 12% of basic)
- Employer ESIC: 715 (auto-calculated: 3.25% of gross)
- Agency Commission: 2500 (YOUR MARKUP - enter manually)
- Total Bill Rate: 27015 (auto-calculated)
- GST Amount: 4863 (auto-calculated: 18%)
- Final Invoice Amount: 31878 (auto-calculated)
```

**Step 6: Save Employee**
- Click "Add Employee"
- Data saved to Google Sheets "Employees" sheet

**What Happens Behind the Scenes:**
```javascript
// Calculations
const basicSalary = 15000
const hra = 5000
const allowances = 2000
const totalPayRate = basicSalary + hra + allowances // 22000

const employerPF = basicSalary * 0.12 // 1800
const employerESIC = totalPayRate * 0.0325 // 715
const agencyCommission = 2500 // YOUR PROFIT PER EMPLOYEE

const totalBillRate = totalPayRate + employerPF + employerESIC + agencyCommission // 27015
const gstAmount = totalBillRate * 0.18 // 4863
const finalInvoiceAmount = totalBillRate + gstAmount // 31878

// Data saved to Google Sheets
{
  'ID': 'EMP001',
  'Employee': 'Rajesh Kumar',
  'Role': 'Security Guard',
  'Status': 'Active',
  'Deployment Status': 'Deployed',
  'Assigned Client': 'Zilla Parishad IT Department',
  'Deployment Date': '2026-01-15',
  'Site Location': 'Pune Office - Gate 2',
  'Shift Start': '09:00',
  'Shift End': '18:00',
  'Phone': '+91 98765 43210',
  'Email': 'rajesh@example.com',
  'Aadhar': '1234 5678 9012',
  'PAN': 'ABCDE1234F',
  
  // VISIBLE TO EMPLOYEE
  'Basic Salary': '15000',
  'HRA': '5000',
  'Allowances': '2000',
  'Total Pay Rate': '22000',
  
  // HIDDEN FROM EMPLOYEE (ADMIN ONLY)
  'Employer PF': '1800',
  'Employer ESIC': '715',
  'Agency Commission': '2500',
  'Total Bill Rate': '27015',
  'GST Amount': '4863',
  'Final Invoice Amount': '31878'
}
```

**Result:**
✅ Employee deployed to client  
✅ Salary configured (₹22,000/month)  
✅ Client billing configured (₹31,878/month)  
✅ Your profit: ₹9,878/month per employee  
✅ Employee only sees ₹22,000 (never knows client pays ₹31,878)  

---

### Workflow 3: Daily Attendance Marking

**Scenario:** Rajesh Kumar arrives at client site and marks attendance.

**Current System (Phase 1):**

**Step 1: Go to Attendance Tab**
- Click "Attendance" in sidebar
- Click "Mark Attendance" button

**Step 2: Select Employee**
- Select "Rajesh Kumar" from dropdown
- Select date (today)

**Step 3: Mark Status**
- Status: Present / Absent / Half Day / Leave
- Time In: 09:00
- Time Out: 18:00
- Notes: (optional)

**Step 4: Save**
- Click "Save Attendance"
- Data saved to Google Sheets "Attendance" sheet

**Future System (Phase 2 - Geofenced):**

**Step 1: Employee Opens Mobile App**
- Opens Vimanasa app on phone
- App requests location permission

**Step 2: GPS Verification**
- App captures GPS coordinates
- Calculates distance from client site
- If within 100m radius → Proceed
- If outside radius → Show error "You are not at the client site"

**Step 3: Face Recognition**
- App opens camera
- Employee takes selfie
- System verifies face matches stored photo
- If match > 85% confidence → Proceed
- If no match → Show error "Face verification failed"

**Step 4: Attendance Marked**
- System records:
  - Employee ID
  - Date & Time
  - GPS coordinates
  - Face verification status
  - Selfie photo
- Attendance saved to database

**Step 5: Confirmation**
- Employee sees "Attendance marked successfully"
- Push notification sent
- Manager notified

---

### Workflow 4: Leave Application & Approval

**Scenario:** Rajesh Kumar needs leave for 3 days.

**Step-by-Step:**

**Step 1: Employee Applies for Leave**
- Go to "Leave" tab
- Click "Apply Leave"
- Fill details:
  ```
  Leave Type: Sick Leave
  Start Date: 2026-05-10
  End Date: 2026-05-12
  Total Days: 3
  Reason: Medical emergency
  ```
- Click "Submit"

**Step 2: Leave Request Saved**
- Data saved to "Leave Requests" sheet
- Status: Pending
- Notification sent to manager

**Step 3: Manager Reviews**
- Manager goes to "Leave" tab
- Sees pending leave request
- Reviews:
  - Employee name
  - Leave type
  - Dates
  - Reason
  - Leave balance

**Step 4: Manager Approves/Rejects**
- Click "Approve" or "Reject"
- Add comments (optional)
- Click "Confirm"

**Step 5: Employee Notified**
- Leave status updated to "Approved" or "Rejected"
- Employee receives notification
- If Phase 2: WhatsApp message sent

**What Happens Behind the Scenes:**
```javascript
// Leave request data
{
  'Employee ID': 'EMP001',
  'Employee Name': 'Rajesh Kumar',
  'Leave Type': 'Sick Leave',
  'Start Date': '2026-05-10',
  'End Date': '2026-05-12',
  'Total Days': '3',
  'Reason': 'Medical emergency',
  'Status': 'Approved',
  'Approved By': 'Admin',
  'Approved On': '2026-05-06',
  'Comments': 'Approved. Get well soon.'
}

// Leave balance updated
currentBalance = 12 days
leavesTaken = 3 days
newBalance = 9 days
```

---

### Workflow 5: Monthly Invoice Generation

**Scenario:** Month-end. Generate invoice for Zilla Parishad IT Department.

**Step-by-Step:**

**Step 1: Lock Attendance (Month-End)**
- Go to "Attendance" tab
- Review all attendance for the month
- Resolve any discrepancies
- Click "Lock Attendance for January 2026"
- Attendance becomes read-only

**Step 2: Go to Invoices Tab**
- Click "Invoices" in sidebar
- Click "Generate Invoice" button

**Step 3: Select Client & Month**
```
Invoice Generation:
- Select Client: Zilla Parishad IT Department
- Billing Month: January 2026
- Due Date: 2026-03-03 (based on Net 30 payment terms)
```

**Step 4: System Calculates Invoice**
```javascript
// System automatically:
1. Finds all employees deployed to this client
2. Calculates working days (26 days in January)
3. Calculates billing for each employee:
   - Rajesh Kumar: ₹31,878 × 26 days = ₹8,28,828
   - Priya Sharma: ₹43,513 × 26 days = ₹11,31,338
   - ... (8 more employees)
4. Sums up total billing
5. Adds GST (18%)
6. Generates invoice number: INV-001
```

**Step 5: Review Invoice Preview**
```
Invoice Preview:
- Client: Zilla Parishad IT Department
- Deployed Staff: 10 Employees
- Subtotal (Before GST): ₹7,02,390
- GST (18%): ₹1,26,430
- Total Invoice Amount: ₹8,28,820
```

**Step 6: Generate Invoice**
- Click "Generate Invoice"
- Invoice saved to "Client_Invoices" sheet
- PDF generated automatically

**Step 7: Download & Send**
- Click "Download PDF"
- Professional invoice PDF downloaded
- Send to client via email
- If Phase 2: WhatsApp message sent automatically

**What Happens Behind the Scenes:**
```javascript
// Invoice calculation
const deployedEmployees = [
  { name: 'Rajesh Kumar', billRate: 31878, days: 26 },
  { name: 'Priya Sharma', billRate: 43513, days: 26 },
  // ... 8 more employees
]

const subtotal = deployedEmployees.reduce((sum, emp) => 
  sum + (emp.billRate * emp.days), 0
) // ₹7,02,390

const gst = subtotal * 0.18 // ₹1,26,430
const total = subtotal + gst // ₹8,28,820

// Invoice data saved
{
  'Invoice Number': 'INV-001',
  'Client Name': 'Zilla Parishad IT Department',
  'Client ID': 'CLI001',
  'Month': '2026-01',
  'Invoice Date': '2026-02-01',
  'Due Date': '2026-03-03',
  'Total Employees': '10',
  'Subtotal': '702390',
  'GST Amount': '126430',
  'Invoice Amount': '828820',
  'Status': 'Pending',
  'Payment Terms': 'Net 30'
}
```

**Result:**
✅ Invoice generated for ₹8,28,820  
✅ Professional PDF created  
✅ Sent to client  
✅ Payment tracking started  

---

### Workflow 6: Payroll Processing

**Scenario:** Generate payslips for all employees.

**Step-by-Step:**

**Step 1: Go to Payroll Tab**
- Click "Payroll" in sidebar
- Click "Payroll Actions" dropdown
- Select "Generate Payslips"

**Step 2: Select Month**
- Select month: January 2026
- System shows all employees

**Step 3: Review Payroll**
```
Payroll Summary:
- Total Employees: 50
- Total Payout: ₹11,00,000
- Deductions (PF, ESIC, PT): ₹1,50,000
- Net Payout: ₹9,50,000
```

**Step 4: Generate Payslips**
- Click "Generate All Payslips"
- System generates PDF for each employee
- Payslips saved to system

**Step 5: Distribute Payslips**
- Option 1: Download all as ZIP
- Option 2: Email to employees
- Option 3 (Phase 2): WhatsApp to employees

**What's in the Payslip:**
```
VIMANASA SERVICES LLP
Payslip for January 2026

Employee: Rajesh Kumar
Employee ID: EMP001
Designation: Security Guard

EARNINGS:
Basic Salary:     ₹15,000
HRA:              ₹5,000
Allowances:       ₹2,000
Gross Salary:     ₹22,000

DEDUCTIONS:
Employee PF:      ₹1,800
Employee ESIC:    ₹495
Professional Tax: ₹200
Total Deductions: ₹2,495

NET SALARY:       ₹19,505

Note: Employee NEVER sees the Bill Rate (₹31,878)
```

---

## Data Flow

### How Data Moves Through the System

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  (Web App - http://localhost:3001)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   REACT COMPONENTS                          │
│  - ClientManagement.js                                      │
│  - EmployeeDeploymentForm.js                               │
│  - ClientInvoicing.js                                       │
│  - AttendanceManager.js                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES                               │
│  - /api/gsheets (GET, POST, PUT, DELETE)                   │
│  - /api/auth (POST)                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 GOOGLE SHEETS API                           │
│  - Authentication (Service Account)                         │
│  - Read/Write Operations                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE SHEETS                              │
│  - Clients Sheet                                            │
│  - Employees Sheet                                          │
│  - Client_Invoices Sheet                                    │
│  - Attendance Sheet                                         │
│  - Leave Requests Sheet                                     │
│  - Expense Claims Sheet                                     │
└─────────────────────────────────────────────────────────────┘
```

### Example: Adding a Client

```
1. User fills form in ClientManagement.js
   ↓
2. Form data sent to page.js handleSave()
   ↓
3. axios.post('/api/gsheets', { sheet: 'Clients', values: [...] })
   ↓
4. API route authenticates with Google
   ↓
5. Google Sheets API appends row to Clients sheet
   ↓
6. Success response sent back
   ↓
7. UI refreshes and shows new client
   ↓
8. Toast notification: "Client added successfully!"
```

---

## Monthly Billing Cycle

### Complete Month-End Process

**Day 1-30: Daily Operations**
```
Daily:
- Employees mark attendance
- Managers approve leaves
- Expenses submitted
- Operations continue normally
```

**Day 28-30: Month-End Preparation**
```
1. HR reviews all attendance
2. Resolves any discrepancies
3. Confirms all leaves approved
4. Verifies deployment status
```

**Day 31 (or 1st of next month): Month-End Close**
```
Morning:
1. Lock attendance for the month
2. Generate attendance reports
3. Review any issues

Afternoon:
4. Generate client invoices
5. Review invoice amounts
6. Download PDFs
7. Send to clients

Evening:
8. Generate employee payslips
9. Process salary payments
10. Distribute payslips
```

**Day 1-5 (Next Month): Collections & Payments**
```
1. Track invoice status
2. Follow up with clients
3. Process salary disbursements
4. Upload PF/ESIC challans
5. Update payment status
```

**Day 5-15: Financial Reconciliation**
```
1. Mark invoices as paid
2. Reconcile bank statements
3. Update financial records
4. Generate profitability reports
5. Review margins
```

---

## Real-World Scenarios

### Scenario 1: Scaling from 10 to 100 Employees

**Challenge:** You started with 10 employees at 1 client. Now you have 100 employees across 5 clients.

**Solution:**

**Month 1-2: Foundation**
- Add all 5 clients with their margins
- Deploy 20 employees per client
- Set up attendance tracking
- Generate first invoices

**Month 3-4: Optimization**
- Implement Phase 2 (geofenced attendance)
- Set up client portal
- Automate WhatsApp notifications
- Build profitability dashboard

**Month 5-6: Scaling**
- Hire sub-admins for operations
- Implement role-based access
- Set up compliance vault
- Automate reporting

**Result:**
- Managing 100 employees efficiently
- 5 clients billed automatically
- 80% reduction in admin time
- Real-time profitability tracking

### Scenario 2: Handling Attendance Fraud

**Problem:** Client complains that employees are marking attendance but not present at site.

**Current Solution (Phase 1):**
1. Review attendance records
2. Cross-check with client
3. Manual verification
4. Disciplinary action

**Better Solution (Phase 2):**
1. Implement geofenced attendance
2. Require face recognition
3. GPS coordinates logged
4. Selfie captured at punch time
5. Automatic fraud detection
6. Real-time alerts to manager

**Result:**
- 95% reduction in attendance fraud
- Client confidence increased
- Automated verification
- Audit trail maintained

### Scenario 3: Client Wants Transparency

**Problem:** Client wants to see real-time attendance of their deployed staff.

**Current Solution (Phase 1):**
1. Generate attendance report
2. Email to client weekly
3. Manual process
4. Delayed information

**Better Solution (Phase 2):**
1. Give client portal access
2. Client logs in anytime
3. Sees real-time attendance
4. Downloads reports themselves
5. Approves monthly timesheets
6. Downloads invoices

**Result:**
- 70% reduction in client queries
- Improved transparency
- Better client satisfaction
- Automated process

### Scenario 4: Profitability Analysis

**Question:** Which client is most profitable?

**Analysis:**

**Client A: Zilla Parishad IT**
```
Deployed: 10 employees
Monthly Revenue: ₹8,28,820
Monthly Cost: ₹6,50,000
Monthly Profit: ₹1,78,820
Margin: 21.6%
```

**Client B: Tech Corp India**
```
Deployed: 15 employees
Monthly Revenue: ₹13,50,000
Monthly Cost: ₹11,00,000
Monthly Profit: ₹2,50,000
Margin: 18.5%
```

**Client C: Manufacturing Ltd**
```
Deployed: 8 employees
Monthly Revenue: ₹6,50,000
Monthly Cost: ₹5,20,000
Monthly Profit: ₹1,30,000
Margin: 20%
```

**Insights:**
- Client A has highest margin (21.6%)
- Client B generates most profit (₹2,50,000)
- Client C is smallest but profitable
- Focus on growing Client A type contracts

**Action:**
- Negotiate better rates with Client B
- Find more clients like Client A
- Optimize costs for Client C

---

## Summary

### Key Takeaways

**1. Dual-Salary is the Core:**
- Employee sees Pay Rate (₹22,000)
- Client pays Bill Rate (₹31,878)
- You keep the difference (₹9,878)
- Employee never knows the markup

**2. Automation Saves Time:**
- Manual invoicing: 4 hours/month
- Automated invoicing: 5 minutes/month
- Time saved: 95%

**3. Transparency Builds Trust:**
- Client portal reduces queries by 70%
- Real-time data improves satisfaction
- Automated reports save time

**4. Data-Driven Decisions:**
- Track profitability by client
- Identify on-bench costs
- Optimize pricing
- Improve margins

**5. Scalability:**
- Phase 1: 10-100 employees
- Phase 2: 100-1,000 employees
- Phase 3: 1,000-10,000 employees

---

**You now have a complete understanding of how the system works!** 🎉

**Next Steps:**
1. Set up Google Sheets
2. Add your first client
3. Deploy your first employee
4. Generate your first invoice
5. Track your profitability

**Questions?** Review the documentation or check the console for errors!
