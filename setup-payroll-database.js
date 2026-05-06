/**
 * Automated Payroll Database Setup Script
 * This script will create all necessary payroll tables in your Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPayrollDatabase() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║        🚀 PAYROLL DATABASE SETUP STARTING... 🚀              ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // Read the SQL file
    console.log('📖 Reading SQL script...');
    const sqlPath = path.join(__dirname, 'scripts', 'create-payroll-tables-FIXED.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL script loaded\n');

    // Execute the SQL
    console.log('⚙️  Executing SQL commands...');
    console.log('   This may take a few seconds...\n');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If RPC doesn't exist, try direct query
      return await supabase.from('_sql').insert({ query: sql });
    });

    if (error) {
      // Try alternative method - split and execute
      console.log('⚙️  Using alternative execution method...\n');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        try {
          // Skip comments and empty statements
          if (statement.startsWith('--') || statement.length < 10) continue;
          
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
          
          if (stmtError) {
            // Some errors are OK (like "already exists")
            if (stmtError.message.includes('already exists')) {
              console.log('   ⚠️  Skipped (already exists)');
            } else {
              console.error(`   ❌ Error: ${stmtError.message}`);
              errorCount++;
            }
          } else {
            successCount++;
          }
        } catch (err) {
          // Ignore certain errors
          if (!err.message.includes('already exists')) {
            errorCount++;
          }
        }
      }

      console.log(`\n   ✅ Executed ${successCount} statements`);
      if (errorCount > 0) {
        console.log(`   ⚠️  ${errorCount} statements had errors (may be OK)\n`);
      }
    } else {
      console.log('✅ SQL executed successfully\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');
    
    const tables = [
      'payroll',
      'salary_advances',
      'employee_loans',
      'payroll_history',
      'tax_declarations',
      'bank_transfer_batches'
    ];

    let verifiedCount = 0;
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (!error) {
        console.log(`   ✅ ${table}`);
        verifiedCount++;
      } else {
        console.log(`   ❌ ${table} - ${error.message}`);
      }
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║          ✅ PAYROLL DATABASE SETUP COMPLETE! ✅              ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Tables Verified: ${verifiedCount} / ${tables.length}\n`);

    if (verifiedCount === tables.length) {
      console.log('🎉 SUCCESS! All tables created successfully!\n');
      console.log('📝 Next Steps:');
      console.log('   1. Import components in your app');
      console.log('   2. Test with sample data');
      console.log('   3. Process your first payroll\n');
      console.log('📚 Documentation: See AUTOMATED_PAYROLL_SYSTEM.md\n');
    } else {
      console.log('⚠️  WARNING: Some tables may not have been created.');
      console.log('   Please run the SQL script manually in Supabase SQL Editor.\n');
      console.log('   File: scripts/create-payroll-tables-FIXED.sql\n');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n📝 Manual Setup Instructions:');
    console.error('   1. Open Supabase Dashboard');
    console.error('   2. Go to SQL Editor');
    console.error('   3. Copy contents from: scripts/create-payroll-tables-FIXED.sql');
    console.error('   4. Paste and click "Run"\n');
    process.exit(1);
  }
}

// Run the setup
setupPayrollDatabase();
