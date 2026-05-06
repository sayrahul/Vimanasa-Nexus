/**
 * Create Partners Sheet in Google Sheets
 * Run this to add the missing Partners sheet
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

async function createPartnersSheet() {
  console.log('🚀 Creating Partners Sheet\n');

  try {
    const auth = new google.auth.JWT(
      SERVICE_ACCOUNT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log('📋 Existing sheets:', existingSheets.join(', '), '\n');

    if (existingSheets.includes('Partners')) {
      console.log('✅ Partners sheet already exists!\n');
      return;
    }

    // Create Partners sheet
    console.log('📄 Creating Partners sheet...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Partners',
              gridProperties: {
                rowCount: 1000,
                columnCount: 35,
                frozenRowCount: 1
              }
            }
          }
        }]
      }
    });
    console.log('   ✅ Partners sheet created');

    // Add headers
    const headers = [[
      'Site ID', 'Partner Name', 'Company Type', 'Industry', 'GST Number', 'PAN Number',
      'Primary Contact Name', 'Primary Contact Email', 'Primary Contact Phone',
      'Secondary Contact Name', 'Secondary Contact Email', 'Secondary Contact Phone',
      'Address Line 1', 'City', 'State', 'Pincode', 'Address Line 2',
      'Contract Start Date', 'Contract End Date', 'Contract Value', 'Billing Cycle', 'Payment Terms',
      'Service Type', 'Required Headcount', 'Shift Type', 'Working Hours', 'Working Days', 'Weekly Off',
      'Performance Rating', 'Outstanding Amount', 'Last Payment Date', 'Status', 'Remarks'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Partners!A1:AG1',
      valueInputOption: 'RAW',
      requestBody: { values: headers }
    });
    console.log('   ✅ Headers added');

    // Format headers
    const updatedSpreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const partnersSheet = updatedSpreadsheet.data.sheets.find(
      s => s.properties.title === 'Partners'
    );

    if (partnersSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: partnersSheet.properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    fontSize: 11,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }]
        }
      });
      console.log('   ✅ Headers formatted');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 PARTNERS SHEET CREATED!');
    console.log('='.repeat(70));
    console.log('\n✅ You can now add partners in the app!');
    console.log('\n🔗 Your Google Sheet:');
    console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    console.log('\n💡 Alternative: Create manually in Google Sheets:');
    console.log('   1. Open your Google Sheet');
    console.log('   2. Click + button to add new sheet');
    console.log('   3. Rename it to "Partners"');
    console.log('   4. Copy-paste these headers in row 1:');
    console.log('\nSite ID\tPartner Name\tCompany Type\tIndustry\tGST Number\tPAN Number\tPrimary Contact Name\tPrimary Contact Email\tPrimary Contact Phone\tSecondary Contact Name\tSecondary Contact Email\tSecondary Contact Phone\tAddress Line 1\tCity\tState\tPincode\tAddress Line 2\tContract Start Date\tContract End Date\tContract Value\tBilling Cycle\tPayment Terms\tService Type\tRequired Headcount\tShift Type\tWorking Hours\tWorking Days\tWeekly Off\tPerformance Rating\tOutstanding Amount\tLast Payment Date\tStatus\tRemarks');
    console.log('\n');
  }
}

createPartnersSheet();
