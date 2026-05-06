# 🚀 Complete Workflow Guide - Vimanasa Outsourcing OS

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Access](#user-roles--access)
3. [Complete Business Workflow](#complete-business-workflow)
4. [Module-by-Module Guide](#module-by-module-guide)
5. [Real-World Scenarios](#real-world-scenarios)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Best Practices](#best-practices)

---

## 🎯 System Overview

### What is Vimanasa Outsourcing OS?

**Before**: A single-tenant HRMS for managing your own employees  
**Now**: A multi-tenant Outsourcing OS for managing employees deployed to multiple clients

### Key Transformation:
- **Client-Centric**: Every employee is mapped to a client
- **Dual-Salary Structure**: Pay Rate (what you pay) + Bill Rate (what you charge)
- **Automated Invoicing**: Generate professional client invoices automatically
- **Profitability Tracking**: Real-time margin and commission tracking
- **Security**: Financial data hidden from employees

---

## 👥 User Roles & Access

### 1. Super Admin (You)
**Access**: Everything  
**Can See**:
- ✅ All client information
- ✅ Pay Rate (what you pay employees)
- ✅ Bill Rate (what you charge clients)
- ✅ Agency margins and commissions
- ✅ Profitability data
- ✅ All financial calculations
- ✅ Client invoices
- ✅ Employee deployment status

**Can Do**:
- Add/edit/delete clients
- Set agency margins
- Deploy employees to clients
- Set Pay Rate and Bill Rate
- Generate client invoices
- Track profitability
- Manage all employees
- View all reports

---

### 2. Sub-Admin / HR Manager
**Access**: Limited  
**Can See**:
- ✅ Employee information
- ✅ Pay Rate (what you pay employees)
- ❌ Bill Rate (hidden)
- ❌ Agency margins (hidden)
- ❌ Client invoices (hidden)
- ✅ Attendance and leaves
- ✅ Deployment status

**Can Do**:
- Add/edit employees
- Manage attendance
- Approve leaves
- View employee payroll
- Deploy employees (if authorized)

---

### 3. Employee
**Access**: Very Limited  
**Can See**:
- ✅ Their own Pay Rate
- ✅ Their own attendance
- ✅ Their own leaves
- ✅ Their own payslips
- ❌ Bill Rate (hidden)
- ❌ Agency margins (hidden)
- ❌ Client information (hidden)
- ❌ Other employees' data

**Can Do**:
- Mark attendance
- Apply for leaves
- View their payslips
- Update their profile

---

## 🔄 Complete Business Workflow

### Phase 1: Client Onboarding (Admin)

#### Step 1.1: Add New Client
1. **Login** as Admin
2. **Go to**: Clients tab (in sidebar)
3. **Click**: "Add New Client" button
4. **Fill in**:
   - Client Name (e.g., "Zilla Parishad IT Department")
   - GST Number
   - Location
   - Contact Person details
   - Payment Terms (Net 30, Net 45, etc.)
   - Contract Start & End dates
   - **Agency Margin**: 8.5% or 10% or flat fee
   - Margin Type: Percentage or Flat Fee
   - Does client manage leaves? Yes/No
   - Status: Active/Inactive

5. **Click**: "Add Client"
6. **Result**: Client card appears in the Clients list

**Example**:
```
Client Name: Zilla Parishad IT Department
GST Number: 27AABCU9603R1ZM
Location: Pune, Maharashtra
Contact Person: Mr. Rajesh Kumar
Contact Phone: +91 98765 43210
Contact Email: rajesh@zp.gov.in
Payment Terms: Net 30
Contract Start: 2026-01-01
Contract End: 2027-01-01
Agency Margin: 8.5%
Margin Type: Percentage
Manages Leaves: No
Status: Active
```

---

### Phase 2: Employee Deployment (Admin)

#### Step 2.1: Add Employee (if new)
1. **Go to**: Workforce tab
2. **Click**: "Add Entry" button
3. **Fill in basic details**:
   - Employee ID
   - Name
   - Department
   - Position
   - Join Date
   - Contact details (Phone, Email)
   - KYC documents (Aadhar, PAN)

4. **Click**: "Add Employee"

#### Step 2.2: Deploy Employee to Client
1. **Go to**: Workforce tab
2. **Select**: Employee from list
3. **Click**: "Deploy to Client" button
4. **Fill in deployment details**:
   
   **Client Assignment**:
   - Select Client: "Zilla Parishad IT Department"
   - Deployment Date: 2026-05-01
   - Site Location: Pune Municipal Office
   - Shift Start: 09:00 AM
   - Shift End: 06:00 PM
   
   **Salary Structure (Pay Rate - What YOU Pay)**:
   - Basic Salary: ₹20,000
   - HRA: ₹5,000
   - Allowances: ₹3,000
   - **Total Pay Rate**: ₹28,000 (auto-calculated)
   
   **Employer Statutory (Your Cost)**:
   - Employer PF (12%): ₹3,360 (auto-calculated)
   - Employer ESIC (3.25%): ₹910 (auto-calculated)
   - **Total Statutory**: ₹4,270 (auto-calculated)
   
   **Agency Commission (Your Profit)**:
   - Commission (8.5% of Pay Rate): ₹2,743 (auto-calculated)
   
   **Bill Rate (What You CHARGE Client)**:
   - Pay Rate: ₹28,000
   - Statutory: ₹4,270
   - Commission: ₹2,743
   - **Total Bill Rate**: ₹35,013 (auto-calculated)
   
   **Final Invoice Amount (With GST)**:
   - Bill Rate: ₹35,013
   - GST (18%): ₹6,302 (auto-calculated)
   - **Final Invoice Amount**: ₹41,315 (auto-calculated)

5. **Click**: "Deploy Employee"
6. **Result**: 
   - Employee status changes to "Deployed"
   - Employee is linked to client
   - Financial calculations are saved
   - Client's "Deployed Staff" count increases

---

### Phase 3: Daily Operations (Employee)

#### Step 3.1: Employee Marks Attendance
1. **Employee logs in** to the app
2. **Goes to**: Attendance tab
3. **Marks**: Punch In (with GPS location)
4. **At end of day**: Marks Punch Out
5. **Result**: Attendance recorded in Google Sheets

#### Step 3.2: Employee Applies for Leave
1. **Employee goes to**: Leaves tab
2. **Clicks**: "Apply Leave"
3. **Fills in**:
   - Leave Type (Sick, Casual, etc.)
   - From Date
   - To Date
   - Reason
4. **Clicks**: "Submit"
5. **Result**: Leave request sent to Admin/Sub-Admin

#### Step 3.3: Admin Approves/Rejects Leave
1. **Admin goes to**: Leaves tab
2. **Sees**: Pending leave requests
3. **Reviews**: Request details
4. **Clicks**: "Approve" or "Reject"
5. **Result**: Employee notified, leave balance updated

---

### Phase 4: Monthly Billing Cycle (Admin)

#### Step 4.1: Lock Attendance (End of Month)
1. **Date**: 30th or 31st of the month
2. **Admin goes to**: Attendance tab
3. **Reviews**: All attendance records for the month
4. **Resolves**: Any missed punches or discrepancies
5. **Clicks**: "Lock Attendance for [Month]"
6. **Result**: Attendance is finalized, no more changes allowed

#### Step 4.2: Generate Employee Payroll
1. **Admin goes to**: Finance tab
2. **Selects**: Month
3. **Clicks**: "Generate Payroll"
4. **System calculates**:
   - Total working days
   - Present days
   - Absent days
   - Leave days
   - Salary based on Pay Rate
   - Deductions (Employee PF, ESIC, etc.)
   - Net Salary

5. **Clicks**: "Generate Payslips"
6. **Result**: Payslips generated for all employees

#### Step 4.3: Generate Client Invoices
1. **Admin goes to**: Invoices tab
2. **Selects**: Client (e.g., "Zilla Parishad IT Department")
3. **Selects**: Month (e.g., "April 2026")
4. **Clicks**: "Generate Invoice"

5. **System automatically**:
   - Fetches all employees deployed to this client
   - Calculates total working days for each employee
   - Multiplies working days × Bill Rate
   - Adds GST (18%)
   - Creates invoice number (e.g., INV-2026-04-001)
   - Generates professional PDF

6. **Invoice Preview Shows**:
   ```
   INVOICE
   
   From: Vimanasa Nexus
   To: Zilla Parishad IT Department
   Invoice Number: INV-2026-04-001
   Invoice Date: 2026-04-30
   Due Date: 2026-05-30 (Net 30)
   
   Employee Details:
   ┌─────────────────┬──────────┬───────────┬────────────┐
   │ Employee Name   │ Days     │ Bill Rate │ Amount     │
   ├─────────────────┼──────────┼───────────┼────────────┤
   │ Rahul Sharma    │ 26       │ ₹35,013   │ ₹9,10,338  │
   │ Priya Patel     │ 24       │ ₹32,500   │ ₹7,80,000  │
   │ Amit Kumar      │ 26       │ ₹38,000   │ ₹9,88,000  │
   └─────────────────┴──────────┴───────────┴────────────┘
   
   Subtotal: ₹26,78,338
   GST (18%): ₹4,82,101
   ───────────────────────────
   Total Amount: ₹31,60,439
   
   Payment Terms: Net 30 days
   Bank Details: [Your bank details]
   ```

7. **Clicks**: "Download PDF"
8. **Clicks**: "Mark as Sent"
9. **Result**: 
   - Professional PDF invoice downloaded
   - Invoice saved in Google Sheets
   - Status: "Pending"

#### Step 4.4: Track Invoice Payment
1. **When client pays**:
   - **Go to**: Invoices tab
   - **Find**: Invoice
   - **Click**: "Mark as Paid"
   - **Enter**: Payment Date
   - **Click**: "Save"

2. **Result**: 
   - Invoice status changes to "Paid"
   - Payment date recorded
   - Financial reports updated

---

## 📊 Module-by-Module Guide

### 1. Dashboard Module

**What You See**:
- Total Clients
- Total Employees
- Deployed Employees
- On Bench Employees
- Monthly Revenue
- Pending Invoices
- Recent Activities

**Quick Actions**:
- Add New Client
- Deploy Employee
- Generate Invoice
- View Reports

---

### 2. Clients Module

**Features**:
- View all clients in card format
- Search and filter clients
- Add new client
- Edit client details
- View deployed staff per client
- Track contract dates
- Monitor agency margins

**Client Card Shows**:
- Client Name
- Location
- Contact Person
- Deployed Staff Count
- Agency Margin
- Contract Status
- Action buttons (Edit, View Details)

**Actions**:
- **Add Client**: Opens form to add new client
- **Edit Client**: Modify client details
- **View Details**: See full client information
- **Deploy Staff**: Quick link to deploy employees

---

### 3. Workforce Module

**Features**:
- View all employees
- Filter by deployment status (All/Deployed/On Bench/Inactive)
- Add new employee
- Edit employee details
- Deploy employee to client
- View employee financial details (admin only)

**Employee Card Shows**:
- Employee Name
- Employee ID
- Position
- Deployment Status
- Assigned Client (if deployed)
- Pay Rate (visible to admin)
- Bill Rate (visible to admin only)
- Action buttons

**Deployment Form**:
- Client selection
- Deployment date
- Site location
- Shift timings
- Salary structure (Pay Rate)
- Real-time Bill Rate calculation
- GST calculation
- Final invoice amount

---

### 4. Attendance Module

**Features**:
- Mark attendance (Punch In/Out)
- View attendance history
- GPS location tracking
- Monthly attendance report
- Lock attendance (end of month)

**Employee View**:
- Punch In button (with GPS)
- Punch Out button
- Today's status
- Monthly attendance calendar

**Admin View**:
- All employees' attendance
- Filter by date/employee
- Edit attendance (if needed)
- Lock attendance for payroll

---

### 5. Leaves Module

**Features**:
- Apply for leave
- View leave balance
- Track leave status
- Approve/reject leaves (admin)

**Employee View**:
- Apply Leave button
- Leave balance display
- Leave history
- Pending requests

**Admin View**:
- All leave requests
- Pending approvals
- Leave balance management
- Leave reports

---

### 6. Finance Module

**Features**:
- Generate payroll
- View payslips
- Track expenses
- Financial reports

**Payroll Generation**:
- Select month
- Auto-calculate salaries based on attendance
- Apply deductions (PF, ESIC, TDS)
- Generate payslips
- Download payslips (PDF)

**Employee View**:
- View their payslips only
- Download payslips
- See Pay Rate breakdown

**Admin View**:
- All employees' payroll
- Total payroll cost
- Deductions summary
- Bank transfer details

---

### 7. Invoices Module (NEW!)

**Features**:
- Generate client invoices
- View invoice history
- Track invoice status
- Download PDF invoices
- Mark invoices as paid

**Invoice Generation**:
1. Select client
2. Select month
3. System auto-fetches deployed employees
4. System calculates total amount
5. Preview invoice
6. Download PDF
7. Mark as sent

**Invoice List Shows**:
- Invoice Number
- Client Name
- Month
- Invoice Date
- Total Amount
- Status (Pending/Paid)
- Actions (View, Download, Mark Paid)

**Invoice PDF Includes**:
- Company branding
- Client details
- Employee breakdown
- Bill Rate per employee
- Working days
- Subtotal
- GST (18%)
- Total amount
- Payment terms
- Bank details

---

### 8. Settings Module

**Features**:
- Company profile
- User management
- System settings
- Backup & restore

**Company Profile**:
- Company name
- Logo
- GST number
- Bank details
- Contact information

**User Management**:
- Add users
- Set roles (Admin/Sub-Admin/Employee)
- Manage permissions
- Reset passwords

---

## 🎬 Real-World Scenarios

### Scenario 1: Onboarding a New Client

**Situation**: You've won a contract with "Tech Corp India" to provide 5 IT staff.

**Steps**:
1. **Add Client**:
   - Go to Clients tab
   - Click "Add New Client"
   - Fill in: Tech Corp India, GST, contact details
   - Set agency margin: 10%
   - Contract: 1 year
   - Payment terms: Net 45
   - Save

2. **Deploy 5 Employees**:
   - Go to Workforce tab
   - For each employee:
     - Select employee
     - Click "Deploy to Client"
     - Select "Tech Corp India"
     - Set Pay Rate (e.g., ₹30,000)
     - System calculates Bill Rate (e.g., ₹38,500)
     - Save

3. **Result**:
   - 5 employees deployed
   - Client card shows "5 Deployed Staff"
   - Ready to track attendance and generate invoices

---

### Scenario 2: Monthly Billing for Multiple Clients

**Situation**: End of April 2026, you need to bill all clients.

**Steps**:
1. **Lock Attendance** (April 30):
   - Go to Attendance tab
   - Review all attendance
   - Click "Lock Attendance for April 2026"

2. **Generate Payroll**:
   - Go to Finance tab
   - Select "April 2026"
   - Click "Generate Payroll"
   - Review and approve
   - Generate payslips

3. **Generate Client Invoices**:
   - Go to Invoices tab
   - For each client:
     - Select client (e.g., "Zilla Parishad")
     - Select month "April 2026"
     - Click "Generate Invoice"
     - Preview invoice
     - Download PDF
     - Email to client
     - Mark as "Sent"

4. **Track Payments**:
   - As clients pay, mark invoices as "Paid"
   - Record payment dates
   - Monitor pending invoices

---

### Scenario 3: Employee Goes On Bench

**Situation**: A client contract ends, and 3 employees are now unassigned.

**Steps**:
1. **Update Employee Status**:
   - Go to Workforce tab
   - For each employee:
     - Click "Edit"
     - Change Deployment Status to "On Bench"
     - Clear "Assigned Client"
     - Save

2. **Result**:
   - Employees marked as "On Bench"
   - Dashboard shows increased bench count
   - You can now redeploy them to other clients
   - No billing for these employees until redeployed

---

### Scenario 4: Profitability Analysis

**Situation**: You want to know your profit margin for April 2026.

**Steps**:
1. **View Payroll Total**:
   - Go to Finance tab
   - Select "April 2026"
   - See total payroll: ₹15,00,000

2. **View Invoice Total**:
   - Go to Invoices tab
   - Filter by "April 2026"
   - See total invoices: ₹19,50,000

3. **Calculate Profit**:
   - Total Invoices: ₹19,50,000
   - Total Payroll: ₹15,00,000
   - Gross Profit: ₹4,50,000
   - Profit Margin: 23%

4. **Analyze by Client**:
   - See which clients are most profitable
   - Adjust agency margins if needed
   - Make strategic decisions

---

## 📈 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    VIMANASA OUTSOURCING OS                  │
│                         DATA FLOW                           │
└─────────────────────────────────────────────────────────────┘

1. CLIENT ONBOARDING
   ┌──────────────┐
   │ Add Client   │ → Google Sheets (Clients)
   │ Set Margin   │
   └──────────────┘

2. EMPLOYEE DEPLOYMENT
   ┌──────────────┐
   │ Deploy to    │ → Google Sheets (Employees)
   │ Client       │    - Deployment Status
   │ Set Pay Rate │    - Assigned Client
   │ Set Bill Rate│    - Pay Rate
   └──────────────┘    - Bill Rate
                       - Agency Commission

3. DAILY ATTENDANCE
   ┌──────────────┐
   │ Employee     │ → Google Sheets (Attendance)
   │ Punches In   │    - Date
   │ Punches Out  │    - Time
   └──────────────┘    - GPS Location

4. LEAVE MANAGEMENT
   ┌──────────────┐
   │ Employee     │ → Google Sheets (Leaves)
   │ Applies      │    - Leave Type
   │ Leave        │    - Dates
   └──────────────┘    - Status

5. MONTHLY PAYROLL
   ┌──────────────┐
   │ Lock         │ → Calculate Salary
   │ Attendance   │    Based on Pay Rate
   │              │ → Generate Payslips
   └──────────────┘ → Google Sheets (Finance)

6. CLIENT INVOICING
   ┌──────────────┐
   │ Generate     │ → Fetch Deployed Employees
   │ Invoice      │ → Calculate Bill Rate × Days
   │              │ → Add GST (18%)
   │              │ → Generate PDF
   └──────────────┘ → Google Sheets (Client_Invoices)

7. PAYMENT TRACKING
   ┌──────────────┐
   │ Client Pays  │ → Update Invoice Status
   │              │ → Record Payment Date
   └──────────────┘ → Google Sheets (Client_Invoices)
```

---

## 💰 Financial Flow Example

### Example: One Employee for One Month

**Employee**: Rahul Sharma  
**Client**: Zilla Parishad IT Department  
**Month**: April 2026  
**Working Days**: 26 days

#### Your Costs (What You Pay):
```
Pay Rate Structure:
├─ Basic Salary:        ₹20,000
├─ HRA:                 ₹5,000
├─ Allowances:          ₹3,000
└─ Total Pay Rate:      ₹28,000

Employer Statutory:
├─ Employer PF (12%):   ₹3,360
├─ Employer ESIC (3.25%): ₹910
└─ Total Statutory:     ₹4,270

Total Cost to You:      ₹32,270
```

#### Your Revenue (What You Charge):
```
Bill Rate Structure:
├─ Pay Rate:            ₹28,000
├─ Statutory:           ₹4,270
├─ Agency Commission (8.5%): ₹2,743
└─ Total Bill Rate:     ₹35,013

With GST:
├─ Bill Rate:           ₹35,013
├─ GST (18%):           ₹6,302
└─ Final Invoice:       ₹41,315

Total Revenue:          ₹41,315
```

#### Your Profit:
```
Revenue (excl. GST):    ₹35,013
Cost:                   ₹32,270
─────────────────────────────
Gross Profit:           ₹2,743
Profit Margin:          8.5%
```

**Note**: GST is collected from client and paid to government, so it's not your profit.

---

## 🎯 Best Practices

### 1. Client Management
- ✅ Set realistic agency margins (8-12% is standard)
- ✅ Review contracts before expiry
- ✅ Maintain good client relationships
- ✅ Track deployed staff count regularly
- ✅ Update contact information promptly

### 2. Employee Deployment
- ✅ Always set both Pay Rate and Bill Rate
- ✅ Verify calculations before saving
- ✅ Document deployment dates
- ✅ Keep site location updated
- ✅ Review shift timings with client

### 3. Attendance Management
- ✅ Lock attendance by 1st of next month
- ✅ Resolve discrepancies before locking
- ✅ Verify GPS locations for remote staff
- ✅ Maintain attendance backup
- ✅ Communicate attendance policy clearly

### 4. Leave Management
- ✅ Approve/reject leaves within 24 hours
- ✅ Maintain leave balance accurately
- ✅ Coordinate with clients for leave approvals
- ✅ Track leave patterns
- ✅ Update leave policy annually

### 5. Payroll Processing
- ✅ Generate payroll by 5th of next month
- ✅ Verify all calculations
- ✅ Maintain payroll records for 7 years
- ✅ Ensure timely salary disbursement
- ✅ Keep payslips confidential

### 6. Client Invoicing
- ✅ Generate invoices by 1st of next month
- ✅ Send invoices within 2 days
- ✅ Follow up on pending payments
- ✅ Maintain invoice numbering sequence
- ✅ Keep PDF copies for records

### 7. Financial Management
- ✅ Track profitability monthly
- ✅ Analyze margins by client
- ✅ Monitor bench time
- ✅ Plan for statutory payments
- ✅ Maintain separate accounts for GST

### 8. Data Security
- ✅ Keep Bill Rate confidential
- ✅ Restrict access to financial data
- ✅ Regular backups of Google Sheets
- ✅ Use strong passwords
- ✅ Log out after use

---

## 📱 Quick Reference

### Daily Tasks:
- [ ] Monitor attendance
- [ ] Approve leave requests
- [ ] Respond to employee queries

### Weekly Tasks:
- [ ] Review deployment status
- [ ] Check pending invoices
- [ ] Follow up with clients
- [ ] Update employee records

### Monthly Tasks:
- [ ] Lock attendance (30th/31st)
- [ ] Generate payroll (1st-5th)
- [ ] Generate client invoices (1st-2nd)
- [ ] Send invoices to clients (2nd-3rd)
- [ ] Track invoice payments
- [ ] Review profitability
- [ ] Plan next month deployments

### Quarterly Tasks:
- [ ] Review client contracts
- [ ] Analyze profitability by client
- [ ] Update agency margins if needed
- [ ] Review employee performance
- [ ] Plan for new client acquisition

---

## 🆘 Common Questions

### Q1: Can I change the Bill Rate after deployment?
**A**: Yes, go to Workforce → Select Employee → Edit → Update Bill Rate. This will apply from next billing cycle.

### Q2: What if an employee works for multiple clients?
**A**: Currently, one employee can be deployed to one client at a time. For multiple clients, you'll need to split their time manually in the invoice.

### Q3: How do I handle partial months?
**A**: The system calculates based on actual working days. If an employee joins mid-month, only those days are billed.

### Q4: Can clients see the Bill Rate?
**A**: No, Bill Rate is visible only to Super Admin. Clients only see the final invoice amount.

### Q5: What if a client doesn't pay on time?
**A**: Track overdue invoices in the Invoices tab. Follow up with client. You can also add late payment charges if agreed in contract.

### Q6: How do I handle employee resignations?
**A**: Change deployment status to "Inactive". Generate final payroll and invoice for worked days. Update client about replacement.

### Q7: Can I export data?
**A**: Yes, all data is in Google Sheets. You can export to Excel/CSV anytime.

### Q8: How do I backup data?
**A**: Google Sheets auto-saves. Additionally, download monthly backups from Google Sheets (File → Download).

---

## 🎊 Conclusion

Your Vimanasa Outsourcing OS is now a complete solution for managing:
- ✅ Multiple clients
- ✅ Employee deployments
- ✅ Dual-salary structures
- ✅ Automated invoicing
- ✅ Profitability tracking

**Start using it today and transform your outsourcing business!** 🚀

---

## 📞 Support

For questions or issues:
1. Check this workflow guide
2. Review other documentation files
3. Check Google Sheets for data
4. Contact your development team

---

**Last Updated**: May 6, 2026  
**Version**: 1.0 (Phase 1A Complete)  
**Next Phase**: Phase 2 - Advanced Features (Geofencing, Client Portal, WhatsApp, etc.)
