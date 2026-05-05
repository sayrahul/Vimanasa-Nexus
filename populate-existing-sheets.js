// Script to populate existing sheets with sample data
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function populateSheets() {
  console.log('📝 Populating existing sheets with sample data...\n');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // Populate Employees sheet
    console.log('👥 Populating Employees sheet...');
    const employeesData = [
      ['ID', 'Employee', 'Role', 'Status'],
      ['EMP001', 'Rajesh Kumar', 'Security Guard', 'Active'],
      ['EMP002', 'Priya Sharma', 'Supervisor', 'Active'],
      ['EMP003', 'Amit Patel', 'Security Guard', 'Active'],
      ['EMP004', 'Sneha Reddy', 'Manager', 'Active'],
      ['EMP005', 'Vikram Singh', 'Security Guard', 'On Leave'],
      ['EMP006', 'Anjali Desai', 'Security Guard', 'Active'],
      ['EMP007', 'Rahul Verma', 'Supervisor', 'Active'],
      ['EMP008', 'Kavita Nair', 'Security Guard', 'Active']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Employees!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: employeesData }
    });
    console.log('✓ Employees sheet populated with', employeesData.length - 1, 'employees\n');

    // Populate Clients sheet
    console.log('🏢 Populating Clients sheet...');
    const clientsData = [
      ['Site ID', 'Partner Name', 'Location', 'Headcount'],
      ['SITE001', 'Tech Corp India', 'Mumbai, Maharashtra', '25'],
      ['SITE002', 'Finance Solutions Ltd', 'Delhi NCR', '15'],
      ['SITE003', 'Retail Mega Mart', 'Bangalore, Karnataka', '30'],
      ['SITE004', 'Manufacturing Hub', 'Pune, Maharashtra', '20'],
      ['SITE005', 'IT Services Park', 'Hyderabad, Telangana', '18'],
      ['SITE006', 'Corporate Tower', 'Chennai, Tamil Nadu', '22']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Clients!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: clientsData }
    });
    console.log('✓ Clients sheet populated with', clientsData.length - 1, 'clients\n');

    console.log('✅ All sheets populated successfully!\n');
    console.log('📊 View your spreadsheet: https://docs.google.com/spreadsheets/d/' + spreadsheetId);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

populateSheets();
