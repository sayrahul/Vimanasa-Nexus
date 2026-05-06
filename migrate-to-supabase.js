const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
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

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sheet to table mapping
const sheetToTable = {
  'Employees': 'employees',
  'Clients': 'clients',
  'Partners': 'partners',
  'Payroll': 'payroll',
  'Attendance': 'attendance',
  'Leave Requests': 'leave_requests',
  'Expense Claims': 'expense_claims',
  'Client_Invoices': 'client_invoices',
  'Finance': 'finance',
  'Compliance': 'compliance'
};

async function fetchSheetData(sheetName) {
  try {
    console.log(`  📥 Fetching data from ${sheetName}...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];
    
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return data;
  } catch (error) {
    console.error(`  ❌ Error fetching ${sheetName}:`, error.message);
    return [];
  }
}

async function migrateSheet(sheetName, tableName) {
  console.log(`\n📊 Migrating ${sheetName} → ${tableName}`);
  console.log('─'.repeat(60));
  
  const data = await fetchSheetData(sheetName);
  
  if (data.length === 0) {
    console.log(`  ⚠️  No data found in ${sheetName}`);
    return { success: 0, errors: 0, skipped: 0 };
  }
  
  console.log(`  📝 Found ${data.length} rows`);
  
  // Remove empty rows
  const transformedData = data.filter(row => {
    return Object.values(row).some(val => val && val.trim() !== '');
  });
  
  if (transformedData.length === 0) {
    console.log(`  ⚠️  No valid data to migrate from ${sheetName}`);
    return { success: 0, errors: 0, skipped: data.length };
  }
  
  console.log(`  ✓ ${transformedData.length} valid rows to migrate`);
  
  // Insert in batches of 50 (Supabase limit)
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(transformedData.length / batchSize);
    
    process.stdout.write(`  ⏳ Processing batch ${batchNum}/${totalBatches}...`);
    
    const { data: inserted, error } = await supabase
      .from(tableName)
      .insert(batch)
      .select();
    
    if (error) {
      console.log(` ❌`);
      console.error(`     Error: ${error.message}`);
      errorCount += batch.length;
    } else {
      console.log(` ✅ (${inserted.length} rows)`);
      successCount += inserted.length;
    }
  }
  
  console.log(`\n  📊 Results:`);
  console.log(`     ✅ Success: ${successCount}`);
  console.log(`     ❌ Errors: ${errorCount}`);
  console.log(`     ⏭️  Skipped: ${data.length - transformedData.length}`);
  
  return { success: successCount, errors: errorCount, skipped: data.length - transformedData.length };
}

async function migrateAll() {
  console.log('\n🚀 VIMANASA NEXUS - DATA MIGRATION');
  console.log('═'.repeat(60));
  console.log('📍 Source: Google Sheets');
  console.log('📍 Destination: Supabase (PostgreSQL)');
  console.log('═'.repeat(60));
  
  const totalStats = {
    success: 0,
    errors: 0,
    skipped: 0
  };
  
  for (const [sheetName, tableName] of Object.entries(sheetToTable)) {
    const stats = await migrateSheet(sheetName, tableName);
    totalStats.success += stats.success;
    totalStats.errors += stats.errors;
    totalStats.skipped += stats.skipped;
  }
  
  console.log('\n═'.repeat(60));
  console.log('🎉 MIGRATION COMPLETE!');
  console.log('═'.repeat(60));
  console.log(`📊 Total Statistics:`);
  console.log(`   ✅ Successfully migrated: ${totalStats.success} rows`);
  console.log(`   ❌ Failed: ${totalStats.errors} rows`);
  console.log(`   ⏭️  Skipped (empty): ${totalStats.skipped} rows`);
  console.log('═'.repeat(60));
  
  if (totalStats.errors > 0) {
    console.log('\n⚠️  Some rows failed to migrate. Check the errors above.');
    console.log('💡 Tip: You may need to adjust the data format or table schema.');
  } else if (totalStats.success > 0) {
    console.log('\n✨ All data migrated successfully!');
    console.log('🔗 View your data: https://supabase.com/dashboard/project/nzwwwhufprdultuyzezk');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Verify data in Supabase dashboard');
  console.log('   2. Update .env.local: NEXT_PUBLIC_DATABASE_MODE=supabase');
  console.log('   3. Restart your dev server: npm run dev');
  console.log('   4. Test the application with Supabase');
  console.log('\n');
}

// Run migration
migrateAll().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
