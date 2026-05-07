-- VIMANASA NEXUS - COMPLETE SEED SCRIPT
-- This script will WIPE all existing data and insert robust dummy data for testing the entire core cycle.

-- 1. WIPE ALL DATA (Cascade)
TRUNCATE TABLE clients, partners, workforce, attendance, leave, payroll, invoices, expenses, compliance RESTART IDENTITY CASCADE;

-- 2. INSERT CLIENTS
INSERT INTO clients (data) VALUES
('{"Client ID": "CLI-1001", "Client Name": "Zilla Parishad Pune", "Location": "Pune", "Contact Person": "Rajesh Kumar", "Payment Terms": "Net 30", "Status": "Active", "Deployed Staff": "3"}'),
('{"Client ID": "CLI-1002", "Client Name": "Tech Mahindra Phase 3", "Location": "Hinjewadi", "Contact Person": "Smita Patil", "Payment Terms": "Net 15", "Status": "Active", "Deployed Staff": "4"}'),
('{"Client ID": "CLI-1003", "Client Name": "Adani Data Center", "Location": "Mumbai", "Contact Person": "Amit Shah", "Payment Terms": "Net 45", "Status": "Active", "Deployed Staff": "2"}'),
('{"Client ID": "CLI-1004", "Client Name": "Infosys SEZ", "Location": "Pune", "Contact Person": "Sneha Deshmukh", "Payment Terms": "Net 30", "Status": "Active", "Deployed Staff": "1"}');

-- 3. INSERT EMPLOYEES
-- Some on Bench, Some Deployed. Various salaries to test ESIC rules (< 21000 threshold).
INSERT INTO workforce (data) VALUES
-- Deployed to Zilla Parishad
('{"Employee ID": "EMP-001", "Employee": "Rahul Sharma", "Role": "Security Guard", "Basic Salary": "15000", "HRA": "2000", "Total Bill Rate": "800", "Deployment Status": "Deployed", "Assigned Client": "Zilla Parishad Pune", "Status": "Active", "PF Number": "PF12345", "DOB": "1995-05-15"}'),
('{"Employee ID": "EMP-002", "Employee": "Vikram Singh", "Role": "Supervisor", "Basic Salary": "22000", "HRA": "5000", "Total Bill Rate": "1200", "Deployment Status": "Deployed", "Assigned Client": "Zilla Parishad Pune", "Status": "Active", "PF Number": "PF12346", "DOB": "1992-08-20"}'),
('{"Employee ID": "EMP-003", "Employee": "Pooja Jadhav", "Role": "Clerk", "Basic Salary": "18000", "HRA": "3000", "Total Bill Rate": "900", "Deployment Status": "Deployed", "Assigned Client": "Zilla Parishad Pune", "Status": "Active", "PF Number": "PF12347", "DOB": "1998-01-10"}'),

-- Deployed to Tech Mahindra
('{"Employee ID": "EMP-004", "Employee": "Suresh Raina", "Role": "Housekeeping", "Basic Salary": "12000", "HRA": "1500", "Total Bill Rate": "600", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12348", "DOB": "1990-12-05"}'),
('{"Employee ID": "EMP-005", "Employee": "Anita Desai", "Role": "Receptionist", "Basic Salary": "16000", "HRA": "2000", "Total Bill Rate": "850", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12349", "DOB": "1997-03-25"}'),
('{"Employee ID": "EMP-006", "Employee": "Karan Johar", "Role": "IT Support", "Basic Salary": "25000", "HRA": "6000", "Total Bill Rate": "1500", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12350", "DOB": "1993-07-14"}'),
('{"Employee ID": "EMP-007", "Employee": "Neha Dhupia", "Role": "Facility Manager", "Basic Salary": "30000", "HRA": "8000", "Total Bill Rate": "1800", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12351", "DOB": "1988-11-30"}'),

-- Deployed to Adani
('{"Employee ID": "EMP-008", "Employee": "Ravi Shastri", "Role": "Electrician", "Basic Salary": "20000", "HRA": "4000", "Total Bill Rate": "1100", "Deployment Status": "Deployed", "Assigned Client": "Adani Data Center", "Status": "Active", "PF Number": "PF12352", "DOB": "1985-04-12"}'),
('{"Employee ID": "EMP-009", "Employee": "Mahendra Singh", "Role": "Security Head", "Basic Salary": "28000", "HRA": "7000", "Total Bill Rate": "1600", "Deployment Status": "Deployed", "Assigned Client": "Adani Data Center", "Status": "Active", "PF Number": "PF12353", "DOB": "1981-09-07"}'),

-- Deployed to Infosys
('{"Employee ID": "EMP-010", "Employee": "Virat Kohli", "Role": "Network Engineer", "Basic Salary": "35000", "HRA": "10000", "Total Bill Rate": "2200", "Deployment Status": "Deployed", "Assigned Client": "Infosys SEZ", "Status": "Active", "PF Number": "PF12354", "DOB": "1989-11-05"}'),

-- On Bench (Not Deployed)
('{"Employee ID": "EMP-011", "Employee": "Rohit Sharma", "Role": "Security Guard", "Basic Salary": "15000", "HRA": "2000", "Total Bill Rate": "800", "Deployment Status": "Bench", "Status": "Active", "PF Number": "PF12355", "DOB": "1996-02-18"}'),
('{"Employee ID": "EMP-012", "Employee": "Smriti Mandhana", "Role": "HR Assistant", "Basic Salary": "18000", "HRA": "3000", "Total Bill Rate": "900", "Deployment Status": "Bench", "Status": "Active", "PF Number": "PF12356", "DOB": "1999-06-22"}');


-- 4. INSERT ATTENDANCE (For Current Month - assume month is '2026-05')
-- We'll insert a few days of attendance for Zilla Parishad employees
INSERT INTO attendance (data) VALUES
('{"Date": "2026-05-01", "Employee ID": "EMP-001", "Status": "Present", "employeeName": "Rahul Sharma", "clientName": "Zilla Parishad Pune", "locked": true}'),
('{"Date": "2026-05-01", "Employee ID": "EMP-002", "Status": "Present", "employeeName": "Vikram Singh", "clientName": "Zilla Parishad Pune", "locked": true}'),
('{"Date": "2026-05-01", "Employee ID": "EMP-003", "Status": "Present", "employeeName": "Pooja Jadhav", "clientName": "Zilla Parishad Pune", "locked": true}'),

('{"Date": "2026-05-02", "Employee ID": "EMP-001", "Status": "Present", "employeeName": "Rahul Sharma", "clientName": "Zilla Parishad Pune", "locked": true}'),
('{"Date": "2026-05-02", "Employee ID": "EMP-002", "Status": "On Leave", "employeeName": "Vikram Singh", "clientName": "Zilla Parishad Pune", "locked": true}'),
('{"Date": "2026-05-02", "Employee ID": "EMP-003", "Status": "Present", "employeeName": "Pooja Jadhav", "clientName": "Zilla Parishad Pune", "locked": true}'),

('{"Date": "2026-05-03", "Employee ID": "EMP-001", "Status": "Present", "employeeName": "Rahul Sharma", "clientName": "Zilla Parishad Pune", "locked": true}'),
('{"Date": "2026-05-03", "Employee ID": "EMP-002", "Status": "Present", "employeeName": "Vikram Singh", "clientName": "Zilla Parishad Pune", "locked": true}'),
('{"Date": "2026-05-03", "Employee ID": "EMP-003", "Status": "Absent", "employeeName": "Pooja Jadhav", "clientName": "Zilla Parishad Pune", "locked": true}');


-- 5. INSERT LEAVE REQUESTS
INSERT INTO leave (data) VALUES
('{"employeeId": "EMP-002", "employeeName": "Vikram Singh", "leaveType": "CL", "startDate": "2026-05-02", "endDate": "2026-05-02", "status": "Approved", "reason": "Family function"}'),
('{"employeeId": "EMP-004", "employeeName": "Suresh Raina", "leaveType": "SL", "startDate": "2026-05-10", "endDate": "2026-05-11", "status": "Pending", "reason": "Fever"}');


-- 6. INSERT PAYROLL (Previous Month to show days since payroll)
INSERT INTO payroll (data) VALUES
('{"Date": "2026-04-30", "Month": "2026-04", "Total Payout": "185000", "Pending": "0", "Status": "Paid"}');


-- 7. INSERT INVOICES
INSERT INTO invoices (data) VALUES
('{"clientName": "Zilla Parishad Pune", "month": "2026-04", "invoiceDate": "2026-05-01", "dueDate": "2026-05-30", "totalAmount": "85000", "status": "Sent"}'),
('{"clientName": "Tech Mahindra Phase 3", "month": "2026-04", "invoiceDate": "2026-05-01", "dueDate": "2026-05-15", "totalAmount": "120000", "status": "Overdue"}');


-- 8. INSERT EXPENSES
INSERT INTO expenses (data) VALUES
('{"employeeName": "Admin", "category": "Office Rent", "amount": "25000", "date": "2026-05-01", "status": "approved"}'),
('{"employeeName": "Admin", "category": "Software Subscriptions", "amount": "4500", "date": "2026-05-05", "status": "approved"}'),
('{"employeeName": "Vikram Singh", "category": "Travel", "amount": "1200", "date": "2026-05-06", "status": "Pending"}');


-- 9. INSERT COMPLIANCE
INSERT INTO compliance (data) VALUES
('{"taskId": "pf", "taskName": "PF ECR Filing", "month": "2026-04", "status": "Filed", "amountPaid": "18500", "dateFiled": "2026-05-10", "receiptRef": "PF-TRN-998877"}');
