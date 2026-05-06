/**
 * Direct Google Sheets Setup Script
 * Uses the existing API route to set up sheets
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const BASE_URL = 'http://localhost:3001';

// Wait for server to be ready
async function waitForServer() {
  console.log('⏳ Waiting for dev server to be ready...');
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    try {
      await axios.get(`${BASE_URL}/api/gsheets?sheet=Dashboard`);
      console.log('✅ Server is ready!\n');
      return true;
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.log('\n❌ Server not responding. Please start it with: npm run dev');
  return false;
}

async function setupSheets() {
  console.log('🚀 Starting Google Sheets Setup\n');
  console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID}\n`);
  
  // Check if server is running
  const serverReady = await waitForServer();
  if (!serverReady) {
    process.exit(1);
  }
  
  try {
    // Step 1: Create Clients sheet with data
    console.log('📄 Setting up Clients sheet...');
    
    const clientsData = [
      // Headers
      [
        'Client ID', 'Client Name', 'GST Number', 'Location', 'Contact Person',
        'Contact Phone', 'Contact Email', 'Payment Terms', 'Contract Start',
        'Contract End', 'Agency Margin %', 'Margin Type', 'Manages Leaves',
        'Status', 'Deployed Staff'
      ],
      // Sample Client 1
      [
        'CLI001', 'Zilla Parishad IT Department', '27AABCU9603R1ZM',
        'Pune, Maharashtra', 'Mr. Rajesh Kumar', '+91 98765 43210',
        'rajesh@zp.gov.in', 'Net 30', '2026-01-01', '2027-01-01',
        '8.5', 'Percentage', 'No', 'Active', '0'
      ],
      // Sample Client 2
      [
        'CLI002', 'Tech Corp India', '27AABCU9603R1ZN',
        'Mumbai, Maharashtra', 'Ms. Priya Sharma', '+91 98765 43211',
        'priya@techcorp.com', 'Net 45', '2026-02-01', '2027-02-01',
        '10.0', 'Percentage', 'Yes', 'Active', '0'
      ]
    ];
    
    // Try to add first client
    try {
      await axios.post(`${BASE_URL}/api/gsheets`, {
        sheet: 'Clients',
        values: clientsData[1] // First client
      });
      console.log('   ✅ Added: Zilla Parishad IT Department');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ⚠️  Clients sheet does not exist yet');
        console.log('   📝 Please create it manually following MANUAL_SHEETS_SETUP.md');
      } else {
        console.log('   ℹ️  Client may already exist or sheet needs to be created');
      }
    }
    
    // Try to add second client
    try {
      await axios.post(`${BASE_URL}/api/gsheets`, {
        sheet: 'Clients',
        values: clientsData[2] // Second client
      });
      console.log('   ✅ Added: Tech Corp India');
    } catch (error) {
      console.log('   ℹ️  Client may already exist');
    }
    
    // Step 2: Create Client_Invoices sheet
    console.log('\n📄 Setting up Client_Invoices sheet...');
    console.log('   ℹ️  This sheet will be empty (invoices generated from app)');
    
    // Step 3: Check Employees sheet
    console.log('\n📄 Checking Employees sheet...');
    try {
      const response = await axios.get(`${BASE_URL}/api/gsheets?sheet=Employees`);
      const employees = response.data;
      console.log(`   ✅ Employees sheet exists with ${employees.length} employees`);
      
      if (employees.length > 0) {
        const firstEmployee = employees[0];
        const hasNewColumns = 'Deployment Status' in firstEmployee;
        
        if (hasNewColumns) {
          console.log('   ✅ New columns already added');
        } else {
          console.log('   ⚠️  New columns need to be added manually');
          console.log('   📝 Follow MANUAL_SHEETS_SETUP.md Step 3');
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not check Employees sheet');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SETUP STATUS');
    console.log('='.repeat(60));
    
    console.log('\n✅ What\'s Working:');
    console.log('   • App is running and connected to Google Sheets');
    console.log('   • API routes are functional');
    console.log('   • Sample clients attempted to be added');
    
    console.log('\n📝 Manual Steps Required:');
    console.log('   1. Open your Google Sheet:');
    console.log(`      https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    console.log('   2. Create "Clients" sheet if it doesn\'t exist');
    console.log('   3. Create "Client_Invoices" sheet');
    console.log('   4. Add 20 new columns to "Employees" sheet');
    console.log('   5. Grant Editor access to: rahul-mwsnoc@appspot.gserviceaccount.com');
    
    console.log('\n📚 Detailed Instructions:');
    console.log('   • MANUAL_SHEETS_SETUP.md - Complete setup guide');
    console.log('   • SHEETS_SETUP_VISUAL_GUIDE.md - Visual guide');
    console.log('   • SETUP_QUICK_REFERENCE.txt - Quick reference');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Follow MANUAL_SHEETS_SETUP.md (15 minutes)');
    console.log('   2. Refresh the app at http://localhost:3001');
    console.log('   3. Go to Clients tab to see your clients');
    console.log('   4. Start deploying employees!');
    
    console.log('\n✨ Once setup is complete, you\'ll have:');
    console.log('   • Client management with hidden margins');
    console.log('   • Dual-salary structure (Pay Rate vs Bill Rate)');
    console.log('   • Automated invoice generation');
    console.log('   • Professional PDF invoices');
    console.log('   • Real-time profitability tracking');
    
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure dev server is running: npm run dev');
    console.log('   2. Check that you can access: http://localhost:3001');
    console.log('   3. Follow the manual setup guide: MANUAL_SHEETS_SETUP.md');
    console.log('');
  }
}

// Run setup
setupSheets();
