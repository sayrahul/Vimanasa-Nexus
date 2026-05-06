/**
 * Diagnose Google Sheets API Authentication
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

async function diagnose() {
  console.log('🔍 Diagnosing Google Sheets API Authentication\n');
  console.log('📋 Configuration:');
  console.log(`   Spreadsheet ID: ${SPREADSHEET_ID}`);
  console.log(`   Service Account: ${SERVICE_ACCOUNT_EMAIL}`);
  console.log(`   Private Key: ${PRIVATE_KEY ? '✅ Present' : '❌ Missing'}\n`);

  try {
    // Test 1: Check if we can create JWT
    console.log('Test 1: Creating JWT token...');
    const auth = new google.auth.JWT(
      SERVICE_ACCOUNT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    console.log('   ✅ JWT created successfully\n');

    // Test 2: Try to get access token
    console.log('Test 2: Getting access token...');
    try {
      const tokens = await auth.authorize();
      console.log('   ✅ Access token obtained');
      console.log(`   Token type: ${tokens.token_type}`);
      console.log(`   Expires in: ${tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'N/A'}\n`);
    } catch (error) {
      console.log('   ❌ Failed to get access token');
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 3: Try to access spreadsheet
    console.log('Test 3: Accessing spreadsheet...');
    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      
      console.log('   ✅ Spreadsheet accessed successfully');
      console.log(`   Title: ${spreadsheet.data.properties.title}`);
      console.log(`   Sheets: ${spreadsheet.data.sheets.map(s => s.properties.title).join(', ')}\n`);
      
      console.log('═'.repeat(70));
      console.log('🎉 ALL TESTS PASSED!');
      console.log('═'.repeat(70));
      console.log('\n✅ Authentication is working correctly!');
      console.log('✅ You can run: node auto-setup.js\n');
      
    } catch (error) {
      console.log('   ❌ Failed to access spreadsheet');
      console.log(`   Error: ${error.message}\n`);
      
      console.log('═'.repeat(70));
      console.log('❌ AUTHENTICATION FAILED');
      console.log('═'.repeat(70));
      
      if (error.message.includes('unregistered callers')) {
        console.log('\n💡 Issue: Google Sheets API not enabled for this service account\'s project\n');
        console.log('📝 The service account email suggests it\'s from App Engine:');
        console.log(`   ${SERVICE_ACCOUNT_EMAIL}`);
        console.log('\n🔧 Solutions:');
        console.log('\n   Option 1: Enable API in the correct project');
        console.log('   ─────────────────────────────────────────');
        console.log('   1. The service account is from project: rahul-mwsnoc');
        console.log('   2. Go to: https://console.cloud.google.com/');
        console.log('   3. Select project: rahul-mwsnoc');
        console.log('   4. Go to: APIs & Services → Library');
        console.log('   5. Search for "Google Sheets API"');
        console.log('   6. Click "Enable"');
        console.log('   7. Run this script again');
        console.log('\n   Option 2: Manual Setup (Faster!)');
        console.log('   ─────────────────────────────────────────');
        console.log('   Follow the guide: COPY_PASTE_SETUP.md');
        console.log('   Takes only 5 minutes of copy-pasting!');
        console.log('   No authentication issues!');
        console.log('\n   Option 3: Create new service account');
        console.log('   ─────────────────────────────────────────');
        console.log('   1. Go to the project where you enabled the API');
        console.log('   2. Create a new service account in that project');
        console.log('   3. Update .env.local with new credentials');
        
      } else if (error.message.includes('permission')) {
        console.log('\n💡 Issue: Service account doesn\'t have access to the spreadsheet\n');
        console.log('🔧 Solution:');
        console.log('   1. Open your Google Sheet');
        console.log('   2. Click "Share" button');
        console.log('   3. Add: rahul-mwsnoc@appspot.gserviceaccount.com');
        console.log('   4. Set permission to "Editor"');
        console.log('   5. Uncheck "Notify people"');
        console.log('   6. Click "Share"');
        console.log('   7. Run this script again');
      }
      
      console.log('\n');
    }

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
    console.log('\n💡 Check your .env.local file for correct credentials\n');
  }
}

diagnose();
