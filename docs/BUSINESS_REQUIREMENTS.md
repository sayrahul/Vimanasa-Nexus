# VIMANASA NEXUS: CORE BUSINESS CYCLE & REQUIREMENTS BLUEPRINT

## THE CORE BUSINESS CYCLE (How Money Flows)
1. Client gives work order
2. You deploy employees to client site
3. Employees work → Attendance marked daily
4. Month ends → Payroll calculated from attendance
5. Invoice raised to client → Client pays you
6. You pay employees salary
7. Profit = Client Payment - Employee Salaries - Expenses

---

## STEP 1 — CLIENT ONBOARDING
When you get a new client contract:
*   The form must collect: Company name, address, GSTIN, Contact person name + phone + email, Contract start date and end date, Bill Rate per employee per day (this is your income source), Payment terms (Net 30, Net 15 etc.), Required manpower count, Site location / work location, Contract PDF upload link.
*   After the client is added, the system should auto-create a 'Manpower Requirement' entry showing how many employees this client needs.

## STEP 2 — EMPLOYEE ONBOARDING
When you hire a new employee:
*   The form must collect:
    *   Personal Info — Name, DOB, Phone, Address, Emergency Contact
    *   Identity Documents — Aadhar number, PAN number, photo upload
    *   Bank Details — Account number, IFSC, Bank name (for salary transfer)
    *   Employment Details — Role/designation, Basic Salary, Date of Joining
    *   Statutory Info — PF account number, ESIC number
*   Auto-generate Employee ID on save.
*   After the employee is added, their status should default to 'Bench' (not yet deployed). System should show a 'Bench Employees' count on the dashboard.

## STEP 3 — DEPLOYMENT
When you assign an employee to a client site:
*   Add a Deployment Module where admin selects: Employee name (from Bench list), Client name, Site location, Deployment start date, Expected end date, Role at client site, Client bill rate for this employee specifically.
*   When saved, employee status changes from Bench → Deployed and client's deployed count increases by 1.
*   Show a Deployment History for each employee — which clients they worked for, from when to when.

## STEP 4 — DAILY ATTENDANCE
Every working day:
*   Attendance marking: Admin selects date -> System shows only Deployed employees (bench employees don't need attendance) -> Admin marks: Present / Absent / Half Day / On Leave.
*   If an employee is on approved leave, system auto-marks 'On Leave'.
*   Save once for all employees — not one by one.
*   SMS/WhatsApp confirmation sent to employee after marking.
*   **Attendance Lock feature**: Once attendance is saved for a date, it cannot be changed without admin password.

## STEP 5 — LEAVE MANAGEMENT
When an employee applies for leave:
*   Workflow: Employee submits leave request -> Admin gets pending notification -> Admin reviews -> If Approved, dates auto-marked as 'On Leave' in attendance -> Leave balance reduces automatically.
*   Leave types:
    *   Casual Leave (CL) — 12 per year
    *   Sick Leave (SL) — 6 per year
    *   Earned Leave (EL) — accrues monthly
    *   Loss of Pay (LOP) — when balance is zero, auto-flag for payroll deduction.

## STEP 6 — MONTHLY PAYROLL
At the end of every month:
*   **Step A — Pull Attendance Data**: Total working days - Absent days = Payable days
*   **Step B — Calculate Gross Salary**: (Basic Salary ÷ Total Working Days) × Days Present = Earned Basic
*   **Step C — Add Allowances**: HRA + Travel Allowance + Special Allowance (if configured)
*   **Step D — Calculate Deductions**:
    *   PF Employee Share = 12% of Basic
    *   ESIC Employee Share = 0.75% of Gross (if salary < ₹21,000)
    *   Professional Tax = as per state slab
    *   Loan/Advance deduction = pending amount
    *   LOP deduction = if unpaid leaves taken
*   **Step E — Net Salary**: Gross Earned - Total Deductions = Net Pay
*   **Step F — Employer Contributions**:
    *   PF Employer = 13% of Basic
    *   ESIC Employer = 3.25% of Gross
*   **Post-Payroll Actions**: Generate PDF payslip for each employee, Show total salary cost, Mark payroll status as Processed, Send payslip PDF link to employee on WhatsApp.

## STEP 7 — CLIENT INVOICING
After payroll — bill the client:
*   Admin selects Client + Month -> System auto-fetches deployed employees, attendance, bill rate.
*   Auto-calculates: Employees × Bill Rate × Days Present = Base Amount
*   Add GST 18% on top -> Generate professional PDF invoice with letterhead.
*   Show payment due date based on client's payment terms -> Send invoice PDF to client email directly.
*   **Invoice tracking**: Status: Sent → Partially Paid → Fully Paid → Overdue. If overdue by 7 days — auto reminder email. If 30 days — flag on dashboard.

## STEP 8 — EXPENSE TRACKING
Throughout the month:
*   Categories: Recruitment costs, Travel & conveyance, Office expenses, Employee welfare, Compliance filing fees, Bank charges.
*   Each expense needs: Amount, Date, Category, Receipt proof, Paid by whom.
*   **Monthly P&L**: Total Client Invoiced Amount - Total Salary Paid - Total Expenses = Net Profit.

## STEP 9 — STATUTORY COMPLIANCE
Monthly/Quarterly government filings:
*   Calendar auto-populates deadlines: PF ECR (15th), ESIC Challan (15th), Professional Tax (15th), TDS Payment (7th), GST Returns (11th/20th), TDS Return (quarterly).
*   Admin uploads filed challan/receipt, marks as Filed, adds amount paid (feeds into Financial Ledger).

## STEP 10 — REPORTING
For business decisions:
*   **HR Reports**: Employee headcount by client site, Attendance summary, Leave utilization, Bench strength.
*   **Finance Reports**: Monthly P&L, Client-wise revenue, Salary cost vs billing revenue, Outstanding invoice report.
*   **Compliance Reports**: PF/ESIC monthly statements, PT register.

---

## 🚨 CRITICAL RULES YOUR SOFTWARE MUST ENFORCE
1.  "Never allow payroll to run if attendance for that month is not fully marked — show error: 'Attendance incomplete for X employees'"
2.  "Never allow an employee to be deployed to two clients at the same time"
3.  "If an employee's salary exceeds ₹21,000 gross — automatically exclude them from ESIC calculation"
4.  "If PF number is not added for an employee — block payroll generation and show warning"
5.  "Invoice amount must never be less than total salary cost for that client site — show profit margin warning if it is"





remove all exisitng data.. and add 10+ dummy data so i can test...

and give systematic test documents how to test everything manually..  guide me step by step 

i want test all features, all functions one by one manually...