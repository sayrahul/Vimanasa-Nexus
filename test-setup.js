/**
 * Test Google Sheets Setup
 * Run this after manual setup to verify everything works
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testSetup() {
  console.log('🧪 Testing Google Sheets Setup\n');
  
  let allPassed = true;
  
  try {
    // Test 1: Check Clients sheet
    console.log('1️⃣  Testing Clients sheet...');
    try {
      const response = await axios.get(`${BASE_URL}/api/gsheets?sheet=Clients`);
      const clients = response.data;
      
      if (clients && clients.length >= 2) {
        console.log(`   ✅ Clients sheet exists with ${clients.length} clients`);
        console.log(`      - ${clients[0]['Client Name']}`);
        console.log(`      - ${clients[1]['Client Name']}`);
      } else if (clients && clients.length > 0) {
        console.log(`   ⚠️  Clients sheet exists but only has ${clients.length} client(s)`);
        console.log(`      Expected at least 2 sample clients`);
        allPassed = false;
      } else {
        console.log(`   ❌ Clients sheet is empty`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`   ❌ Clients sheet not found or not accessible`);
      console.log(`      Error: ${error.message}`);
      allPassed = false;
    }
    
    // Test 2: Check Client_Invoices sheet
    console.log('\n2️⃣  Testing Client_Invoices sheet...');
    try {
      const response = await axios.get(`${BASE_URL}/api/gsheets?sheet=Client_Invoices`);
      console.log(`   ✅ Client_Invoices sheet exists`);
      console.log(`      Ready for invoice generation`);
    } catch (error) {
      console.log(`   ❌ Client_Invoices sheet not found`);
      console.log(`      Error: ${error.message}`);
      allPassed = false;
    }
    
    // Test 3: Check Employees sheet
    console.log('\n3️⃣  Testing Employees sheet...');
    try {
      const response = await axios.get(`${BASE_URL}/api/gsheets?sheet=Employees`);
      const employees = response.data;
      
      if (employees && employees.length > 0) {
        const firstEmployee = employees[0];
        const requiredColumns = [
          'Deployment Status',
          'Assigned Client',
          'Basic Salary',
          'Total Pay Rate',
          'Total Bill Rate',
          'Final Invoice Amount'
        ];
        
        const missingColumns = requiredColumns.filter(col => !(col in firstEmployee));
        
        if (missingColumns.length === 0) {
          console.log(`   ✅ Employees sheet has all required columns`);
          console.log(`      ${employees.length} employee(s) found`);
        } else {
          console.log(`   ⚠️  Employees sheet missing columns:`);
          missingColumns.forEach(col => console.log(`      - ${col}`));
          allPassed = false;
        }
      } else {
        console.log(`   ⚠️  Employees sheet is empty`);
        console.log(`      Add employees to test fully`);
      }
    } catch (error) {
      console.log(`   ❌ Employees sheet not found`);
      console.log(`      Error: ${error.message}`);
      allPassed = false;
    }
    
    // Test 4: Check API connectivity
    console.log('\n4️⃣  Testing API connectivity...');
    try {
      await axios.get(`${BASE_URL}/api/gsheets?sheet=Dashboard`);
      console.log(`   ✅ API is responding correctly`);
    } catch (error) {
      console.log(`   ❌ API not responding`);
      console.log(`      Make sure dev server is running: npm run dev`);
      allPassed = false;
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('='.repeat(60));
      console.log('\n✅ Your Outsourcing OS is ready to use!');
      console.log('\n🚀 Next Steps:');
      console.log('   1. Open http://localhost:3001');
      console.log('   2. Login with: admin / Vimanasa@2026');
      console.log('   3. Go to Clients tab to see your clients');
      console.log('   4. Go to Workforce tab to deploy employees');
      console.log('   5. Go to Invoices tab to generate invoices');
      console.log('\n📚 Documentation:');
      console.log('   - QUICK_START_OUTSOURCING.md');
      console.log('   - COMPLETE_WORKFLOW_DETAILED.md');
      console.log('   - MASTER_ROADMAP.md');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
      console.log('='.repeat(60));
      console.log('\n📝 Please complete the setup:');
      console.log('   1. Follow COPY_PASTE_SETUP.md (5 minutes)');
      console.log('   2. Or follow MANUAL_SHEETS_SETUP.md (detailed)');
      console.log('   3. Run this test again: node test-setup.js');
      console.log('\n💡 Common Issues:');
      console.log('   - Sheet names must be exact: Clients, Client_Invoices, Employees');
      console.log('   - Service account needs Editor access');
      console.log('   - Dev server must be running on port 3001');
    }
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure dev server is running: npm run dev');
    console.log('   2. Check that you can access: http://localhost:3001');
    console.log('   3. Follow the setup guide: COPY_PASTE_SETUP.md');
    console.log('');
  }
}

// Run tests
testSetup();
