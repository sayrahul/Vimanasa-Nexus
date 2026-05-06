const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const sheetNames = [
  'Employees',
  'Clients',
  'Partners',
  'Payroll',
  'Attendance',
  'Leave Requests',
  'Expense Claims',
  'Client_Invoices',
  'Finance',
  'Compliance'
];

async function inspectSheet(sheetName) {
  try {
    console.log(`\n📊 ${sheetName}`);
    console.log('─'.repeat(60));
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });
    
    const headers = response.data.values?.[0];
    
    if (!headers || headers.length === 0) {
      console.log('  ⚠️  No headers found');
      return;
    }
    
    console.log(`  📝 Columns (${headers.length}):`);
    headers.forEach((header, index) => {
      console.log(`     ${index + 1}. "${header}"`);
    });
    
    // Get row count
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });
    
    const rowCount = (dataResponse.data.values?.length || 1) - 1; // Subtract header
    console.log(`  📊 Data rows: ${rowCount}`);
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

async function inspectAll() {
  console.log('\n🔍 GOOGLE SHEETS STRUCTURE INSPECTION');
  console.log('═'.repeat(60));
  console.log(`📍 Spreadsheet ID: ${spreadsheetId}`);
  console.log('═'.repeat(60));
  
  for (const sheetName of sheetNames) {
    await inspectSheet(sheetName);
  }
  
  console.log('\n═'.repeat(60));
  console.log('✅ Inspection complete!');
  console.log('═'.repeat(60));
  console.log('\n💡 Use this information to create proper column mappings');
  console.log('   for the migration script.\n');
}

inspectAll().catch(console.error);
