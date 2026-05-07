const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Map frontend tabs to database tables
const tableMapping = {
  workforce: 'employees',
  clients: 'clients',
  partners: 'partners',
  payroll: 'payroll',
  finance: 'finance',
  compliance: 'compliance',
  attendance: 'attendance',
  leave: 'leave_requests',
  expenses: 'expense_claims',
  invoices: 'client_invoices'
};

async function seed() {
  console.log('Starting data wipe & seed process...');

  const tables = Object.values(tableMapping);
  
  for (const dbTable of tables) {
    console.log(`Wiping ${dbTable}...`);
    const { error } = await supabase.from(dbTable).delete().not('id', 'is', null);
    if (error) console.error(`Error wiping ${dbTable}:`, error);
  }

  console.log('\nInserting Dummy Data via API simulation...');
  const baseUrl = 'http://localhost:3000/api/database';

  const insertData = async (frontendTable, records) => {
    for (const record of records) {
      try {
        const res = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: frontendTable, data: record })
        });
        if (!res.ok) console.error(`Failed to insert into ${frontendTable}`);
      } catch (e) {
        console.error(`Error inserting into ${frontendTable}:`, e.message);
      }
    }
    console.log(`Inserted ${records.length} records into ${frontendTable}`);
  };

  // Month strings
  const currMonth = new Date().toISOString().slice(0, 7);
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonth = prevDate.toISOString().slice(0, 7);

  // Workforce
  const workforce = [
    {"Employee ID": "EMP-001", "Employee": "Rahul Sharma", "Role": "Security Guard", "Basic Salary": "15000", "HRA": "2000", "Total Bill Rate": "800", "Deployment Status": "Deployed", "Assigned Client": "Zilla Parishad Pune", "Status": "Active", "PF Number": "PF12345", "DOB": "1995-05-15"},
    {"Employee ID": "EMP-002", "Employee": "Vikram Singh", "Role": "Supervisor", "Basic Salary": "22000", "HRA": "5000", "Total Bill Rate": "1200", "Deployment Status": "Deployed", "Assigned Client": "Zilla Parishad Pune", "Status": "Active", "PF Number": "PF12346", "DOB": "1992-08-20"},
    {"Employee ID": "EMP-003", "Employee": "Pooja Jadhav", "Role": "Clerk", "Basic Salary": "18000", "HRA": "3000", "Total Bill Rate": "900", "Deployment Status": "Deployed", "Assigned Client": "Zilla Parishad Pune", "Status": "Active", "PF Number": "PF12347", "DOB": "1998-01-10"},
    {"Employee ID": "EMP-004", "Employee": "Suresh Raina", "Role": "Housekeeping", "Basic Salary": "12000", "HRA": "1500", "Total Bill Rate": "600", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12348", "DOB": "1990-12-05"},
    {"Employee ID": "EMP-005", "Employee": "Anita Desai", "Role": "Receptionist", "Basic Salary": "16000", "HRA": "2000", "Total Bill Rate": "850", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12349", "DOB": "1997-03-25"},
    {"Employee ID": "EMP-006", "Employee": "Karan Johar", "Role": "IT Support", "Basic Salary": "25000", "HRA": "6000", "Total Bill Rate": "1500", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12350", "DOB": new Date(Date.now() + 86400000 * 2).toISOString()}, // Birthday in 2 days
    {"Employee ID": "EMP-007", "Employee": "Neha Dhupia", "Role": "Facility Manager", "Basic Salary": "30000", "HRA": "8000", "Total Bill Rate": "1800", "Deployment Status": "Deployed", "Assigned Client": "Tech Mahindra Phase 3", "Status": "Active", "PF Number": "PF12351", "DOB": "1988-11-30"},
    {"Employee ID": "EMP-008", "Employee": "Ravi Shastri", "Role": "Electrician", "Basic Salary": "20000", "HRA": "4000", "Total Bill Rate": "1100", "Deployment Status": "Deployed", "Assigned Client": "Adani Data Center", "Status": "Active", "PF Number": "PF12352", "DOB": "1985-04-12"},
    {"Employee ID": "EMP-009", "Employee": "Mahendra Singh", "Role": "Security Head", "Basic Salary": "28000", "HRA": "7000", "Total Bill Rate": "1600", "Deployment Status": "Deployed", "Assigned Client": "Adani Data Center", "Status": "Active", "PF Number": "PF12353", "DOB": new Date(Date.now() + 86400000 * 5).toISOString()}, // Birthday in 5 days
    {"Employee ID": "EMP-010", "Employee": "Virat Kohli", "Role": "Network Engineer", "Basic Salary": "35000", "HRA": "10000", "Total Bill Rate": "2200", "Deployment Status": "Deployed", "Assigned Client": "Infosys SEZ", "Status": "Active", "PF Number": "PF12354", "DOB": "1989-11-05"},
    {"Employee ID": "EMP-011", "Employee": "Rohit Sharma", "Role": "Security Guard", "Basic Salary": "15000", "HRA": "2000", "Total Bill Rate": "800", "Deployment Status": "On Bench", "Status": "Active", "PF Number": "PF12355", "DOB": "1996-02-18"},
    {"Employee ID": "EMP-012", "Employee": "Smriti Mandhana", "Role": "HR Assistant", "Basic Salary": "18000", "HRA": "3000", "Total Bill Rate": "900", "Deployment Status": "On Bench", "Status": "Active", "PF Number": "PF12356", "DOB": "1999-06-22"}
  ];
  await insertData('workforce', workforce);

  // Clients
  const clients = [
    {"Client ID": "CLI-1001", "Client Name": "Zilla Parishad Pune", "Location": "Pune", "Contact Person": "Rajesh Kumar", "Payment Terms": "Net 30", "Status": "Active", "Deployed Staff": "3"},
    {"Client ID": "CLI-1002", "Client Name": "Tech Mahindra Phase 3", "Location": "Hinjewadi", "Contact Person": "Smita Patil", "Payment Terms": "Net 15", "Status": "Active", "Deployed Staff": "4"},
    {"Client ID": "CLI-1003", "Client Name": "Adani Data Center", "Location": "Mumbai", "Contact Person": "Amit Shah", "Payment Terms": "Net 45", "Status": "Active", "Deployed Staff": "2"},
    {"Client ID": "CLI-1004", "Client Name": "Infosys SEZ", "Location": "Pune", "Contact Person": "Sneha Deshmukh", "Payment Terms": "Net 30", "Status": "Active", "Deployed Staff": "1"}
  ];
  await insertData('clients', clients);

  // Fetch the created employees to map UUIDs for attendance
  const { data: dbEmployees } = await supabase.from('employees').select('id, metadata');
  
  // Attendance
  let attendance = [];
  if (dbEmployees && dbEmployees.length > 0) {
    const emp1 = dbEmployees.find(e => e.metadata?.["Employee ID"] === "EMP-001");
    const emp2 = dbEmployees.find(e => e.metadata?.["Employee ID"] === "EMP-002");
    const emp3 = dbEmployees.find(e => e.metadata?.["Employee ID"] === "EMP-003");

    if (emp1 && emp2 && emp3) {
      attendance = [
        {"Date": `${currMonth}-01`, "Employee ID": "EMP-001", "employeeId": emp1.id, "Status": "Present", "employeeName": "Rahul Sharma", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-01`, "Employee ID": "EMP-002", "employeeId": emp2.id, "Status": "Present", "employeeName": "Vikram Singh", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-01`, "Employee ID": "EMP-003", "employeeId": emp3.id, "Status": "Present", "employeeName": "Pooja Jadhav", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-02`, "Employee ID": "EMP-001", "employeeId": emp1.id, "Status": "Present", "employeeName": "Rahul Sharma", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-02`, "Employee ID": "EMP-002", "employeeId": emp2.id, "Status": "On Leave", "employeeName": "Vikram Singh", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-02`, "Employee ID": "EMP-003", "employeeId": emp3.id, "Status": "Present", "employeeName": "Pooja Jadhav", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-03`, "Employee ID": "EMP-001", "employeeId": emp1.id, "Status": "Present", "employeeName": "Rahul Sharma", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-03`, "Employee ID": "EMP-002", "employeeId": emp2.id, "Status": "Present", "employeeName": "Vikram Singh", "clientName": "Zilla Parishad Pune", "locked": true},
        {"Date": `${currMonth}-03`, "Employee ID": "EMP-003", "employeeId": emp3.id, "Status": "Absent", "employeeName": "Pooja Jadhav", "clientName": "Zilla Parishad Pune", "locked": true}
      ];
      await insertData('attendance', attendance);
    }
  }

  // Leave Requests
  const leave = [
    {"employeeId": "EMP-002", "employeeName": "Vikram Singh", "leaveType": "CL", "startDate": `${currMonth}-02`, "endDate": `${currMonth}-02`, "status": "Approved", "reason": "Family function"},
    {"employeeId": "EMP-004", "employeeName": "Suresh Raina", "leaveType": "SL", "startDate": `${currMonth}-10`, "endDate": `${currMonth}-11`, "status": "Pending", "reason": "Fever"}
  ];
  await insertData('leave', leave);

  // Payroll
  const payroll = [
    {"Date": `${prevMonth}-30`, "Month": prevMonth, "Total Payout": "185000", "Pending": "0", "Status": "Paid"}
  ];
  await insertData('payroll', payroll);

  // Invoices
  const invoices = [
    {"clientName": "Zilla Parishad Pune", "month": prevMonth, "invoiceDate": `${currMonth}-01`, "dueDate": `${currMonth}-30`, "totalAmount": "85000", "status": "Sent"},
    {"clientName": "Tech Mahindra Phase 3", "month": prevMonth, "invoiceDate": `${currMonth}-01`, "dueDate": `${currMonth}-15`, "totalAmount": "120000", "status": "Overdue"}
  ];
  await insertData('invoices', invoices);

  // Expenses
  const expenses = [
    {"employeeName": "Admin", "category": "Office Rent", "amount": "25000", "date": `${currMonth}-01`, "status": "approved"},
    {"employeeName": "Admin", "category": "Software Subscriptions", "amount": "4500", "date": `${currMonth}-05`, "status": "approved"},
    {"employeeName": "Vikram Singh", "category": "Travel", "amount": "1200", "date": `${currMonth}-06`, "status": "Pending"}
  ];
  await insertData('expenses', expenses);

  // Compliance
  const compliance = [
    {"taskId": "pf", "taskName": "PF ECR Filing", "month": prevMonth, "status": "Filed", "amountPaid": "18500", "dateFiled": `${currMonth}-10`, "receiptRef": "PF-TRN-998877"}
  ];
  await insertData('compliance', compliance);

  console.log('\n✅ DUMMY DATA SEEDING COMPLETE!');
}

seed().catch(console.error);
