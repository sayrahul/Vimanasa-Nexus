// Script to set up Google Sheets with the correct structure
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function setupGoogleSheets() {
  console.log('🚀 Setting up Google Sheets for Vimanasa Nexus...\n');

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

    // Get existing sheets
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = metadata.data.sheets.map(s => s.properties.title);
    
    console.log('📊 Current sheets:', existingSheets.join(', '));
    console.log('');

    // Define required sheets with their headers and sample data
    const requiredSheets = {
      'Dashboard': {
        headers: ['Staff', 'Deployed', 'Clients', 'Payroll'],
        sampleData: [
          ['124', '98', '12', '₹1,200,000']
        ]
      },
      'Employees': {
        headers: ['ID', 'Employee', 'Role', 'Status'],
        sampleData: [
          ['EMP001', 'Rajesh Kumar', 'Security Guard', 'Active'],
          ['EMP002', 'Priya Sharma', 'Supervisor', 'Active'],
          ['EMP003', 'Amit Patel', 'Security Guard', 'Active'],
          ['EMP004', 'Sneha Reddy', 'Manager', 'Active'],
          ['EMP005', 'Vikram Singh', 'Security Guard', 'On Leave']
        ]
      },
      'Clients': {
        headers: ['Site ID', 'Partner Name', 'Location', 'Headcount'],
        sampleData: [
          ['SITE001', 'Tech Corp India', 'Mumbai, Maharashtra', '25'],
          ['SITE002', 'Finance Solutions Ltd', 'Delhi NCR', '15'],
          ['SITE003', 'Retail Mega Mart', 'Bangalore, Karnataka', '30'],
          ['SITE004', 'Manufacturing Hub', 'Pune, Maharashtra', '20']
        ]
      },
      'Payroll': {
        headers: ['Month', 'Total Payout', 'Pending', 'Status'],
        sampleData: [
          ['January 2026', '₹1,200,000', '₹0', 'Paid'],
          ['February 2026', '₹1,250,000', '₹50,000', 'Processing'],
          ['March 2026', '₹1,300,000', '₹1,300,000', 'Pending']
        ]
      },
      'Finance': {
        headers: ['Category', 'Amount', 'Date', 'Type'],
        sampleData: [
          ['Client Payment - Tech Corp', '₹500,000', '2026-01-15', 'Income'],
          ['Salary Disbursement', '₹1,200,000', '2026-01-31', 'Expense'],
          ['Office Rent', '₹50,000', '2026-01-05', 'Expense'],
          ['Client Payment - Finance Solutions', '₹300,000', '2026-01-20', 'Income'],
          ['Equipment Purchase', '₹75,000', '2026-01-10', 'Expense']
        ]
      },
      'Compliance': {
        headers: ['Requirement', 'Deadline', 'Status', 'Doc Link'],
        sampleData: [
          ['PF Filing - January', '2026-02-15', 'Completed', 'https://docs.google.com/'],
          ['ESI Return - January', '2026-02-21', 'Pending', 'https://docs.google.com/'],
          ['GST Filing - Q4', '2026-01-31', 'Completed', 'https://docs.google.com/'],
          ['Labour License Renewal', '2026-03-31', 'In Progress', 'https://docs.google.com/']
        ]
      }
    };

    // Create or update sheets
    for (const [sheetName, sheetData] of Object.entries(requiredSheets)) {
      console.log(`📝 Processing sheet: ${sheetName}`);
      
      let sheetId;
      const existingSheet = metadata.data.sheets.find(s => s.properties.title === sheetName);
      
      if (!existingSheet) {
        // Create new sheet
        console.log(`   Creating new sheet: ${sheetName}`);
        const addSheetResponse = await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }]
          }
        });
        sheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
        console.log(`   ✓ Sheet created`);
      } else {
        sheetId = existingSheet.properties.sheetId;
        console.log(`   ✓ Sheet already exists`);
      }

      // Check if sheet has data
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      if (!existingData.data.values || existingData.data.values.length === 0) {
        // Add headers and sample data
        console.log(`   Adding headers and sample data...`);
        const allData = [sheetData.headers, ...sheetData.sampleData];
        
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: allData
          }
        });
        console.log(`   ✓ Data added (${allData.length} rows)`);
      } else {
        console.log(`   ✓ Sheet already has data (${existingData.data.values.length} rows)`);
      }
      
      console.log('');
    }

    console.log('✅ Google Sheets setup completed successfully!\n');
    console.log('📊 Spreadsheet URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    console.log('\n💡 Next steps:');
    console.log('   1. Open the spreadsheet and verify the data');
    console.log('   2. Customize the sample data as needed');
    console.log('   3. Run "npm run dev" to start the application');

  } catch (error) {
    console.error('\n❌ Error setting up Google Sheets:');
    console.error('Error:', error.message);
    
    if (error.code === 403) {
      console.error('\n💡 Permission Error: The service account needs "Editor" access.');
      console.error('   Share the spreadsheet with:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    }
    
    process.exit(1);
  }
}

setupGoogleSheets();
