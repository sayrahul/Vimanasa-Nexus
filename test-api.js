// Test script to verify Google Sheets API connection
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testGoogleSheetsConnection() {
  console.log('🔍 Testing Google Sheets API Connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('✓ GOOGLE_SHEETS_SPREADSHEET_ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? 'Set' : '❌ Missing');
  console.log('✓ GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Set' : '❌ Missing');
  console.log('✓ GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'Set (length: ' + process.env.GOOGLE_PRIVATE_KEY.length + ')' : '❌ Missing');
  console.log('✓ NEXT_PUBLIC_GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'Set' : '❌ Missing');
  console.log('');

  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ Missing required environment variables!');
    process.exit(1);
  }

  try {
    // Initialize Google Auth
    console.log('🔐 Initializing Google Auth...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    console.log('✓ Auth initialized successfully\n');

    // Test reading spreadsheet metadata
    console.log('📊 Testing spreadsheet access...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    console.log('✓ Spreadsheet found:', metadata.data.properties.title);
    console.log('✓ Spreadsheet URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    console.log('');

    // List all sheets
    console.log('📑 Available sheets:');
    metadata.data.sheets.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.properties.title}`);
    });
    console.log('');

    // Test reading each required sheet
    const requiredSheets = ['Dashboard', 'Workforce', 'Partners', 'Payroll', 'Finance', 'Compliance'];
    
    console.log('🔍 Testing data access for required sheets:\n');
    
    for (const sheetName of requiredSheets) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values;
        if (rows && rows.length > 0) {
          console.log(`✓ ${sheetName}: ${rows.length} rows (Headers: ${rows[0].join(', ')})`);
        } else {
          console.log(`⚠️  ${sheetName}: Sheet exists but is empty`);
        }
      } catch (error) {
        console.log(`❌ ${sheetName}: ${error.message}`);
      }
    }

    console.log('\n✅ Google Sheets API test completed successfully!');
    console.log('\n💡 If you see errors above, make sure:');
    console.log('   1. The spreadsheet is shared with:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('   2. The service account has "Editor" or "Viewer" access');
    console.log('   3. All required sheets exist with the correct names');

  } catch (error) {
    console.error('\n❌ Error testing Google Sheets API:');
    console.error('Error:', error.message);
    
    if (error.code === 403) {
      console.error('\n💡 Permission Error: The service account does not have access to the spreadsheet.');
      console.error('   Solution: Share the spreadsheet with:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    } else if (error.code === 404) {
      console.error('\n💡 Not Found: The spreadsheet ID is incorrect or the spreadsheet does not exist.');
      console.error('   Current ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
    } else if (error.message.includes('private_key')) {
      console.error('\n💡 Private Key Error: The private key format is incorrect.');
      console.error('   Make sure the private key includes \\n characters and is wrapped in quotes.');
    }
    
    process.exit(1);
  }
}

testGoogleSheetsConnection();
