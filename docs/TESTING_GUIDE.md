# VIMANASA NEXUS: Systematic Testing Guide

Welcome to the QA phase! This document will guide you step-by-step through testing the entire Vimanasa Nexus platform. I have wiped the old database and inserted a robust set of 12 employees, 4 clients, and several days of attendance to help you test perfectly.

## Pre-Requisites
1. Open your browser and navigate to `http://localhost:3000`
2. You should see the login screen. Login with the credentials.
3. You will land on the **Command Center (Home Dashboard)**.

---

### Step 1: Test The Dashboard (Command Center)
1. **P&L Mini Chart**: Look at the "Monthly P&L Snapshot" chart at the bottom of the dashboard. Verify that Total Income, Total Expenses, and Net Profit are calculated and the percentage bar chart is rendering correctly.
2. **Birthdays**: Look for the purple/pink "🎉 Upcoming Birthdays This Week" card. You should see Karan Johar and Mahendra Singh listed there.
3. **Smart Notifications**: Look at the Bell Icon in the top right. It should have a red badge because there are pending leaves/invoices. 
4. **Days Since Payroll**: You should see a red flashing warning saying "Days Since Payroll: 3X" because the dummy payroll data is from last month.

---

### Step 2: Test Client Management & Expansion
1. Go to **Clients** from the sidebar.
2. Click on the **Zilla Parishad Pune** card. Look for the "3 Deployed" link with the Users icon. 
3. **ACTION**: Click "3 Deployed". A modal should open showing you exactly which 3 employees are deployed there and their daily bill rates.
4. **ACTION**: Click the `Edit` button (pencil icon) on the Adani Data Center card. Change the "Contract End" date to exactly 5 days from today and click Update. 
5. The card should instantly show an orange warning: `⚠️ Contract expires in 5 days`.

---

### Step 3: Test Attendance Engine
1. Go to **Placements -> Attendance Tracking** from the sub-navigation.
2. Select **Zilla Parishad Pune** as the client, and choose **Today's Date**.
3. **ACTION**: Mark Rahul Sharma as `Present`, Vikram Singh as `Absent`, and Pooja Jadhav as `On Leave`.
4. Click **Save Attendance**. 
5. Verify that a success toast appears. Try changing the date back to yesterday to ensure data isolation works.

---

### Step 4: Test Leave Management
1. Go to **Placements -> Leave Management**.
2. Notice the dummy Leave Request from "Suresh Raina" sitting in the **Pending Requests** tab.
3. **ACTION**: Click the green "Approve" button next to his request.
4. It should move to the "Approved Leaves" section, and his overall leave balance should reduce automatically.

---

### Step 5: Test the Payroll Engine (CRITICAL)
1. Go to **Finance -> Payroll Processing**.
2. **ACTION**: Ensure the month is set to the current month, and click **Calculate Payroll**.
3. The engine should automatically pull the employees deployed, cross-check the attendance marked in Step 3, and calculate their "Payable Days". 
4. Look at the ESIC column. Employees earning over ₹21,000 (like Vikram Singh) should show "₹0" for ESIC deduction because the rule is working.
5. Look at the PF column. It should automatically calculate 12% of their basic salary.
6. **ACTION**: Click the blue "Generate Slip" button for any employee. A professional PDF payslip should download. 

---

### Step 6: Test the Client Invoicing Engine (CRITICAL)
1. Go to **Finance -> Client Invoices**.
2. **ACTION**: In the generator form, select **Zilla Parishad Pune** and the current month.
3. The engine will automatically pull the 3 employees deployed there, count their Payable Days from the Attendance Engine, and multiply it by their specific "Total Bill Rate".
4. **Profit Margin Warning Test**: If you generate an invoice where the bill rate is suspiciously low compared to the salary, it will throw a massive red "Profit Margin Warning!". (The dummy data should trigger this or be very close to it).
5. **ACTION**: Click **Generate PDF Invoice**. It will download a professional Vimanasa Letterhead invoice.

---

### Step 7: Test Statutory Compliance (The Shield)
1. Go to **Compliance -> Compliance Calendar**.
2. You will see 6 statutory tasks (PF ECR, ESIC Challan, PT, etc.).
3. Notice that tasks due on the 15th will be marked as **Overdue** (Red) or **Pending** (Gray) depending on today's date.
4. **ACTION**: Click "Mark as Filed" on the **ESIC Challan** card. 
5. Enter a dummy amount (e.g., 4500) and a receipt number (ESIC-123) and click Save.
6. The card should flip to green "Filed" status, and the Progress Bar at the top should increase!

---

### Step 8: Settings UI Check
1. Go to **Settings -> Company Profile**.
2. Verify you can see the new tabs: Company Profile, Salary Components, Leave Policy, User Management, and System Settings.

If you hit any errors or something doesn't look right during this manual QA phase, let me know immediately and we will patch it! Happy Testing!
