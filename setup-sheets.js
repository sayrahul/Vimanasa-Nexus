/**
 * Google Sheets Setup Script
 * This script will add the required sheets to your existing Google Sheets
 * for the Outsourcing OS transformation
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Initialize Google Sheets API
const auth = new google.auth.JWT(
  SERVICE_ACCOUNT_EMAIL,
  null,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

// Sheet configurations
const SHEETS_TO_CREATE = [
  {
    name: 'Clients',
    headers: [
      'Client ID',
      'Client Name',
      'GST Number',
      'Location',
      'Contact Person',
      'Contact Phone',
      'Contact Email',
      'Payment Terms',
      'Contract Start',
      'Contract End',
      'Agency Margin %',
      'Margin Type',
      'Manages Leaves',
      'Status',
      'Deployed Staff'
    ],
    sampleData: [
      [
        'CLI001',
        'Zilla Parishad IT Department',
        '27AABCU9603R1ZM',
        'Pune, Maharashtra',
        'Mr. Rajesh Kumar',
        '+91 98765 43210',
        'rajesh@zp.gov.in',
        'Net 30',
        '2026-01-01',
        '2027-01-01',
        '8.5',
        'Percentage',
        'No',
        'Active',
        '0'
      ],
      [
        'CLI002',
        'Tech Corp India',
        '27AABCU9603R1ZN',
        'Mumbai, Maharashtra',
        'Ms. Priya Sharma',
        '+91 98765 43211',
        'priya@techcorp.com',
        'Net 45',
        '2026-02-01',
        '2027-02-01',
        '10.0',
        'Percentage',
        'Yes',
        'Active',
        '0'
      ]
    ]
  },
  {
    name: 'Client_Invoices',
    headers: [
      'Invoice Number',
      'Client Name',
      'Client ID',
      'Month',
      'Invoice Date',
      'Due Date',
      'Total Employees',
      'Subtotal',
      'GST Amount',
      'Invoice Amount',
      'Status',
      'Payment Terms',
      'Paid Date',
      'Notes'
    ],
    sampleData: [
      // Empty - invoices will be generated from the app
    ]
  }
];

// Columns to add to existing Employees sheet
const EMPLOYEES_NEW_COLUMNS = [
  'Deployment Status',
  'Assigned Client',
  'Deployment Date',
  'Site Location',
  'Shift Start',
  'Shift End',
  'Phone',
  'Email',
  'Aadhar',
  'PAN',
  'Basic Salary',
  'HRA',
  'Allowances',
  'Total Pay Rate',
  'Employer PF',
  'Employer ESIC',
  'Agency Commission',
  'Total Bill Rate',
  'GST Amount',
  'Final Invoice Amount'
];

async function checkSheetExists(sheetName) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheet = response.data.sheets.find(
      s => s.properties.title === sheetName
    );
    
    return sheet ? sheet.properties.sheetId : null;
  } catch (error) {
    console.error(`Error checking sheet ${sheetName}:`, error.message);
    return null;
  }
}

async function createSheet(sheetConfig) {
  console.log(`\n📄 Creating sheet: ${sheetConfig.name}`);
  
  try {
    // Check if sheet already exists
    const existingSheetId = await checkSheetExists(sheetConfig.name);
    
    if (existingSheetId) {
      console.log(`   ⚠️  Sheet "${sheetConfig.name}" already exists. Skipping creation.`);
      return existingSheetId;
    }
    
    // Create the sheet
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetConfig.name,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: sheetConfig.headers.length,
                  frozenRowCount: 1
                }
              }
            }
          }
        ]
      }
    });
    
    const newSheetId = response.data.replies[0].addSheet.properties.sheetId;
    console.log(`   ✅ Sheet created successfully`);
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetConfig.name}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [sheetConfig.headers]
      }
    });
    console.log(`   ✅ Headers added`);
    
    // Format headers (bold, background color)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: newSheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.4,
                    blue: 0.8
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0
                    },
                    fontSize: 11,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }
        ]
      }
    });
    console.log(`   ✅ Headers formatted`);
    
    // Add sample data if provided
    if (sheetConfig.sampleData && sheetConfig.sampleData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetConfig.name}!A2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: sheetConfig.sampleData
        }
      });
      console.log(`   ✅ Sample data added (${sheetConfig.sampleData.length} rows)`);
    }
    
    return newSheetId;
  } catch (error) {
    console.error(`   ❌ Error creating sheet:`, error.message);
    throw error;
  }
}

async function updateEmployeesSheet() {
  console.log(`\n📄 Updating Employees sheet with new columns`);
  
  try {
    // Check if Employees sheet exists
    const employeesSheetId = await checkSheetExists('Employees');
    
    if (!employeesSheetId) {
      console.log(`   ⚠️  Employees sheet not found. Please ensure it exists.`);
      return;
    }
    
    // Get current headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Employees!1:1'
    });
    
    const currentHeaders = response.data.values ? response.data.values[0] : [];
    console.log(`   📊 Current columns: ${currentHeaders.length}`);
    
    // Check which columns need to be added
    const columnsToAdd = EMPLOYEES_NEW_COLUMNS.filter(
      col => !currentHeaders.includes(col)
    );
    
    if (columnsToAdd.length === 0) {
      console.log(`   ✅ All required columns already exist`);
      return;
    }
    
    console.log(`   📝 Adding ${columnsToAdd.length} new columns`);
    
    // Add new columns
    const newHeaders = [...currentHeaders, ...columnsToAdd];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Employees!1:1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newHeaders]
      }
    });
    
    console.log(`   ✅ New columns added successfully`);
    console.log(`   📊 Total columns now: ${newHeaders.length}`);
    
    // Format new header cells
    const startCol = currentHeaders.length;
    const endCol = newHeaders.length;
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: employeesSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: startCol,
                endColumnIndex: endCol
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.4,
                    blue: 0.8
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0
                    },
                    fontSize: 11,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }
        ]
      }
    });
    
    console.log(`   ✅ New headers formatted`);
    
  } catch (error) {
    console.error(`   ❌ Error updating Employees sheet:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Google Sheets Setup for Outsourcing OS\n');
  console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID}`);
  console.log(`📧 Service Account: ${SERVICE_ACCOUNT_EMAIL}\n`);
  
  try {
    // Test connection
    console.log('🔐 Testing connection to Google Sheets...');
    const testResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    console.log(`✅ Connected successfully to: "${testResponse.data.properties.title}"\n`);
    
    // Create new sheets
    console.log('📝 Creating new sheets...');
    for (const sheetConfig of SHEETS_TO_CREATE) {
      await createSheet(sheetConfig);
    }
    
    // Update Employees sheet
    await updateEmployeesSheet();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n✅ Sheets Created/Updated:');
    console.log('   1. Clients (with 2 sample clients)');
    console.log('   2. Client_Invoices (empty, ready for invoices)');
    console.log('   3. Employees (updated with 20 new columns)');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Open your Google Sheet and verify the new sheets');
    console.log('   2. Review the sample clients in the Clients sheet');
    console.log('   3. Update existing employees with deployment info');
    console.log('   4. Start using the app at http://localhost:3001');
    
    console.log('\n📚 Documentation:');
    console.log('   - QUICK_START_OUTSOURCING.md - Quick start guide');
    console.log('   - COMPLETE_WORKFLOW_DETAILED.md - Detailed workflows');
    console.log('   - GOOGLE_SHEETS_SETUP_OUTSOURCING.md - Sheet details');
    
    console.log('\n🔗 Your Google Sheet:');
    console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    
    console.log('\n✨ Your Outsourcing OS is ready to use!\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify your .env.local file has correct credentials');
    console.error('2. Ensure service account has edit access to the sheet');
    console.error('3. Check that the spreadsheet ID is correct');
    console.error('4. Review the error message above for details\n');
    process.exit(1);
  }
}

// Run the setup
main();
