/**
 * Automated Google Sheets Setup
 * Uses the app's existing API to set up sheets
 */

const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

async function setupSheets() {
  console.log('🚀 Starting Automated Google Sheets Setup\n');
  console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID}`);
  console.log(`📧 Service Account: ${SERVICE_ACCOUNT_EMAIL}\n`);

  try {
    // Initialize auth
    const auth = new google.auth.JWT(
      SERVICE_ACCOUNT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('🔐 Authenticating with Google Sheets API...');
    
    // Get spreadsheet info
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    console.log(`✅ Connected to: "${spreadsheet.data.properties.title}"\n`);

    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log('📋 Existing sheets:', existingSheets.join(', '), '\n');

    // Step 1: Create or update Clients sheet
    console.log('📄 Setting up Clients sheet...');
    
    if (!existingSheets.includes('Clients')) {
      // Create Clients sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Clients',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 15,
                  frozenRowCount: 1
                }
              }
            }
          }]
        }
      });
      console.log('   ✅ Clients sheet created');
    } else {
      console.log('   ℹ️  Clients sheet already exists');
    }

    // Add headers and data to Clients sheet
    const clientsData = [
      [
        'Client ID', 'Client Name', 'GST Number', 'Location', 'Contact Person',
        'Contact Phone', 'Contact Email', 'Payment Terms', 'Contract Start',
        'Contract End', 'Agency Margin %', 'Margin Type', 'Manages Leaves',
        'Status', 'Deployed Staff'
      ],
      [
        'CLI001', 'Zilla Parishad IT Department', '27AABCU9603R1ZM',
        'Pune, Maharashtra', 'Mr. Rajesh Kumar', '+91 98765 43210',
        'rajesh@zp.gov.in', 'Net 30', '2026-01-01', '2027-01-01',
        '8.5', 'Percentage', 'No', 'Active', '0'
      ],
      [
        'CLI002', 'Tech Corp India', '27AABCU9603R1ZN',
        'Mumbai, Maharashtra', 'Ms. Priya Sharma', '+91 98765 43211',
        'priya@techcorp.com', 'Net 45', '2026-02-01', '2027-02-01',
        '10.0', 'Percentage', 'Yes', 'Active', '0'
      ]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Clients!A1:O3',
      valueInputOption: 'RAW',
      requestBody: { values: clientsData }
    });
    console.log('   ✅ Headers and sample data added');

    // Format Clients sheet headers
    const clientsSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'Clients') ||
                         (await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID }))
                         .data.sheets.find(s => s.properties.title === 'Clients');
    
    if (clientsSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: clientsSheet.properties.sheetId,
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
      console.log('   ✅ Headers formatted (blue background, white text)');
    }

    // Step 2: Create Client_Invoices sheet
    console.log('\n📄 Setting up Client_Invoices sheet...');
    
    if (!existingSheets.includes('Client_Invoices')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Client_Invoices',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 14,
                  frozenRowCount: 1
                }
              }
            }
          }]
        }
      });
      console.log('   ✅ Client_Invoices sheet created');
    } else {
      console.log('   ℹ️  Client_Invoices sheet already exists');
    }

    // Add headers to Client_Invoices
    const invoicesHeaders = [[
      'Invoice Number', 'Client Name', 'Client ID', 'Month', 'Invoice Date',
      'Due Date', 'Total Employees', 'Subtotal', 'GST Amount', 'Invoice Amount',
      'Status', 'Payment Terms', 'Paid Date', 'Notes'
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Client_Invoices!A1:N1',
      valueInputOption: 'RAW',
      requestBody: { values: invoicesHeaders }
    });
    console.log('   ✅ Headers added');

    // Format Client_Invoices headers
    const updatedSpreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const invoicesSheet = updatedSpreadsheet.data.sheets.find(
      s => s.properties.title === 'Client_Invoices'
    );
    
    if (invoicesSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: invoicesSheet.properties.sheetId,
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

    // Step 3: Update Employees sheet
    console.log('\n📄 Updating Employees sheet...');
    
    if (existingSheets.includes('Employees')) {
      // Get current headers
      const currentHeaders = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Employees!1:1'
      });

      const headers = currentHeaders.data.values ? currentHeaders.data.values[0] : [];
      console.log(`   📊 Current columns: ${headers.length}`);

      // New columns to add
      const newColumns = [
        'Deployment Status', 'Assigned Client', 'Deployment Date', 'Site Location',
        'Shift Start', 'Shift End', 'Phone', 'Email', 'Aadhar', 'PAN',
        'Basic Salary', 'HRA', 'Allowances', 'Total Pay Rate',
        'Employer PF', 'Employer ESIC', 'Agency Commission', 'Total Bill Rate',
        'GST Amount', 'Final Invoice Amount'
      ];

      // Check which columns need to be added
      const columnsToAdd = newColumns.filter(col => !headers.includes(col));

      if (columnsToAdd.length > 0) {
        console.log(`   📝 Adding ${columnsToAdd.length} new columns`);
        
        const updatedHeaders = [...headers, ...columnsToAdd];
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Employees!1:1',
          valueInputOption: 'RAW',
          requestBody: { values: [updatedHeaders] }
        });
        
        console.log(`   ✅ New columns added`);
        console.log(`   📊 Total columns now: ${updatedHeaders.length}`);

        // Format new headers
        const employeesSheet = updatedSpreadsheet.data.sheets.find(
          s => s.properties.title === 'Employees'
        );
        
        if (employeesSheet) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [{
                repeatCell: {
                  range: {
                    sheetId: employeesSheet.properties.sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: headers.length,
                    endColumnIndex: updatedHeaders.length
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
          console.log('   ✅ New headers formatted');
        }
      } else {
        console.log('   ✅ All required columns already exist');
      }
    } else {
      console.log('   ⚠️  Employees sheet not found');
    }

    // Success summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 SETUP COMPLETE!');
    console.log('='.repeat(70));
    
    console.log('\n✅ What was set up:');
    console.log('   1. Clients sheet - Created with 2 sample clients');
    console.log('   2. Client_Invoices sheet - Created and ready for invoices');
    console.log('   3. Employees sheet - Updated with 20 new columns');
    console.log('   4. All headers formatted (blue background, white text)');
    
    console.log('\n🔗 Your Google Sheet:');
    console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Open your app: http://localhost:3001');
    console.log('   2. Login: admin / Vimanasa@2026');
    console.log('   3. Go to Clients tab - you should see 2 clients!');
    console.log('   4. Go to Workforce tab - deploy employees');
    console.log('   5. Go to Invoices tab - generate invoices');
    
    console.log('\n📚 Documentation:');
    console.log('   - QUICK_START_OUTSOURCING.md - Quick start guide');
    console.log('   - COMPLETE_WORKFLOW_DETAILED.md - Detailed workflows');
    console.log('   - MASTER_ROADMAP.md - Complete roadmap');
    
    console.log('\n✨ Your Outsourcing OS is ready to use!\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (error.message.includes('unregistered callers')) {
      console.log('\n💡 The Google Sheets API needs to be enabled:');
      console.log('   1. Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com');
      console.log('   2. Select your project');
      console.log('   3. Click "Enable"');
      console.log('   4. Run this script again');
    } else if (error.message.includes('permission')) {
      console.log('\n💡 Permission issue:');
      console.log('   1. Make sure you shared the sheet with:');
      console.log('      rahul-mwsnoc@appspot.gserviceaccount.com');
      console.log('   2. Permission should be "Editor"');
      console.log('   3. Try again');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your .env.local file');
      console.log('   2. Verify service account credentials');
      console.log('   3. Follow manual setup: COPY_PASTE_SETUP.md');
    }
    console.log('');
  }
}

setupSheets();
