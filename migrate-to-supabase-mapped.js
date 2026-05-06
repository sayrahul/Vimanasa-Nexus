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

// Column mappings: Google Sheets column name → Database column name
const columnMappings = {
  'Employees': {
    'Deployment Status': 'status',
    'Assigned Client': 'designation', // Using designation field
    'Deployment Date': 'date_of_joining',
    'Site Location': 'address',
    'Phone': 'phone',
    'Email': 'email',
    'Aadhar': 'aadhar_number',
    'PAN': 'pan_number',
    'Basic Salary': 'salary',
    // Generate employee_id and name from available data
  },
  'Clients': {
    'Client ID': 'client_id',
    'Client Name': 'company_name',
    'GST Number': 'gstin',
    'Location': 'address',
    'Contact Person': 'contact_person',
    'Contact Phone': 'phone',
    'Contact Email': 'email',
    'Payment Terms': 'billing_cycle',
    'Contract Start': 'contract_start_date',
    'Contract End': 'contract_end_date',
    'Status': 'status',
  },
  'Partners': {
    'Site ID': 'partner_id',
    'Partner Name': 'company_name',
    'GST Number': 'gstin',
    'PAN Number': 'pan_number',
    'Primary Contact Name': 'contact_person',
    'Primary Contact Email': 'email',
    'Primary Contact Phone': 'phone',
    'Address Line 1': 'address',
    'Company Type': 'partnership_type',
    'Status': 'status',
  },
  'Client_Invoices': {
    'Invoice Number': 'invoice_number',
    'Client ID': 'client_id', // Will need to map to UUID later
    'Month': 'description',
    'Invoice Date': 'invoice_date',
    'Due Date': 'due_date',
    'Subtotal': 'amount',
    'GST Amount': 'tax_amount',
    'Invoice Amount': 'total_amount',
    'Status': 'status',
    'Paid Date': 'paid_date',
    'Notes': 'description',
  },
  'Attendance': {
    'Employee_Name': 'employee_id', // Will need to map to UUID later
    'Month': 'date',
    'Days_Worked': 'hours_worked',
    'Base_Salary': 'notes',
  },
  'Finance': {
    'Category': 'category',
    'Amount': 'amount',
    'Date': 'transaction_date',
    'Type': 'transaction_type',
  },
  'Compliance': {
    'Requirement': 'title',
    'Deadline': 'due_date',
    'Status': 'status',
    'Doc Link': 'document_url',
  }
};

function transformRow(sheetName, row, mapping) {
  const transformed = {};
  
  // Apply column mappings
  for (const [sheetsCol, dbCol] of Object.entries(mapping)) {
    if (row[sheetsCol] !== undefined && row[sheetsCol] !== '') {
      transformed[dbCol] = row[sheetsCol];
    }
  }
  
  // Add required fields based on table
  switch (sheetName) {
    case 'Employees':
      // Generate employee_id if not present
      if (!transformed.employee_id) {
        transformed.employee_id = `EMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
      }
      // Generate name from email or use placeholder
      if (!transformed.name) {
        transformed.name = transformed.email ? transformed.email.split('@')[0] : 'Employee';
      }
      // Set default department
      if (!transformed.department) {
        transformed.department = 'General';
      }
      break;
      
    case 'Clients':
      // Ensure client_id exists
      if (!transformed.client_id && transformed.company_name) {
        transformed.client_id = `CLI${Date.now()}${Math.floor(Math.random() * 1000)}`;
      }
      break;
      
    case 'Partners':
      // Ensure partner_id exists
      if (!transformed.partner_id && transformed.company_name) {
        transformed.partner_id = `PAR${Date.now()}${Math.floor(Math.random() * 1000)}`;
      }
      break;
      
    case 'Client_Invoices':
      // For now, skip client_id foreign key (will need manual mapping)
      delete transformed.client_id;
      // Set default status
      if (!transformed.status) {
        transformed.status = 'draft';
      }
      if (!transformed.payment_status) {
        transformed.payment_status = 'unpaid';
      }
      break;
      
    case 'Attendance':
      // Skip for now - needs employee UUID mapping
      return null;
      
    case 'Finance':
      // Set default description
      if (!transformed.description) {
        transformed.description = transformed.category || 'Transaction';
      }
      break;
      
    case 'Compliance':
      // Set default compliance_type
      if (!transformed.compliance_type) {
        transformed.compliance_type = 'General';
      }
      break;
  }
  
  return transformed;
}

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
  
  // Get column mapping for this sheet
  const mapping = columnMappings[sheetName];
  if (!mapping) {
    console.log(`  ⚠️  No column mapping defined for ${sheetName}`);
    return { success: 0, errors: 0, skipped: data.length };
  }
  
  // Transform data
  const transformedData = data
    .map(row => transformRow(sheetName, row, mapping))
    .filter(row => {
      // Remove null rows and empty rows
      if (!row) return false;
      return Object.values(row).some(val => val && val.toString().trim() !== '');
    });
  
  if (transformedData.length === 0) {
    console.log(`  ⚠️  No valid data to migrate from ${sheetName}`);
    return { success: 0, errors: 0, skipped: data.length };
  }
  
  console.log(`  ✓ ${transformedData.length} valid rows to migrate`);
  console.log(`  📋 Sample data:`, JSON.stringify(transformedData[0], null, 2));
  
  // Insert in batches of 50
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
      console.error(`     Details:`, error.details);
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
  console.log('\n🚀 VIMANASA NEXUS - DATA MIGRATION (WITH COLUMN MAPPING)');
  console.log('═'.repeat(60));
  console.log('📍 Source: Google Sheets');
  console.log('📍 Destination: Supabase (PostgreSQL)');
  console.log('═'.repeat(60));
  
  const sheetsToMigrate = {
    'Employees': 'employees',
    'Clients': 'clients',
    'Partners': 'partners',
    'Client_Invoices': 'client_invoices',
    'Finance': 'finance',
    'Compliance': 'compliance',
  };
  
  const totalStats = {
    success: 0,
    errors: 0,
    skipped: 0
  };
  
  for (const [sheetName, tableName] of Object.entries(sheetsToMigrate)) {
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
