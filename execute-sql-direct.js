/**
 * Direct SQL Execution Script
 * Executes the payroll database setup SQL directly
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
  process.exit(1);
}

console.log('\n🔧 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLDirect() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        🚀 PAYROLL DATABASE SETUP STARTING... 🚀              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // Read the SQL file
    console.log('📖 Reading SQL script...');
    const sqlPath = path.join(__dirname, 'scripts', 'create-payroll-tables-FIXED.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL script loaded\n');

    // Split SQL into statements and execute one by one
    console.log('⚙️  Executing SQL commands...\n');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and DO blocks (they're informational)
      if (statement.startsWith('--') || statement.length < 10) {
        continue;
      }

      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: statement + ';' })
        });

        if (response.ok) {
          successCount++;
          if (statement.includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE.*?(\w+)\s*\(/i)?.[1];
            console.log(`   ✅ Created table: ${tableName}`);
          } else if (statement.includes('CREATE INDEX')) {
            console.log(`   ✅ Created index`);
          } else if (statement.includes('CREATE TRIGGER')) {
            console.log(`   ✅ Created trigger`);
          } else if (statement.includes('CREATE POLICY')) {
            console.log(`   ✅ Created policy`);
          }
        } else {
          const error = await response.text();
          if (error.includes('already exists')) {
            skipCount++;
            console.log(`   ⚠️  Skipped (already exists)`);
          } else {
            errorCount++;
            console.log(`   ❌ Error: ${error.substring(0, 100)}`);
          }
        }
      } catch (err) {
        if (err.message.includes('already exists')) {
          skipCount++;
        } else {
          errorCount++;
          console.log(`   ⚠️  ${err.message.substring(0, 100)}`);
        }
      }
    }

    console.log(`\n📊 Execution Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

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
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        
        if (!error) {
          console.log(`   ✅ ${table}`);
          verifiedCount++;
        } else {
          console.log(`   ❌ ${table} - Not accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${table} - ${err.message}`);
      }
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ PAYROLL DATABASE SETUP COMPLETE! ✅              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Tables Verified: ${verifiedCount} / ${tables.length}\n`);

    if (verifiedCount === tables.length) {
      console.log('🎉 SUCCESS! All tables created successfully!\n');
      console.log('📝 Next Steps:');
      console.log('   1. Import components in your app');
      console.log('   2. Test with sample data');
      console.log('   3. Process your first payroll\n');
    } else {
      console.log('⚠️  Some tables may need manual creation.');
      console.log('   Please check Supabase Dashboard > SQL Editor\n');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n📝 Please run the SQL manually in Supabase Dashboard\n');
    process.exit(1);
  }
}

// Run the setup
executeSQLDirect();
