/**
 * Direct SQL Execution Script for All Supabase Tables
 * Executes the complete database setup SQL directly
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

async function setupSupabaseAll() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        🚀 FULL DATABASE SETUP STARTING... 🚀                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // Read the SQL file
    console.log('📖 Reading SQL script...');
    const sqlPath = path.join(__dirname, 'scripts', 'create-all-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL script loaded\n');

    // Split SQL into statements and execute one by one
    console.log('⚙️  Executing SQL commands...\n');
    
    // Custom logic to parse PostgreSQL functions and triggers correctly
    // Split by semicolons but ignore semicolons inside BEGIN...END blocks
    let statements = [];
    let currentStatement = '';
    let insideBlock = false;
    
    const lines = sql.split('\n');
    for (let line of lines) {
      if (line.trim().startsWith('--')) continue; // Skip comments
      
      currentStatement += line + '\n';
      
      if (line.trim().toUpperCase() === 'BEGIN') {
        insideBlock = true;
      }
      
      if (line.trim().toUpperCase().includes('END;') || line.trim() === '$$ LANGUAGE plpgsql;') {
        insideBlock = false;
      }
      
      if (line.trim().endsWith(';') && !insideBlock) {
        if (currentStatement.trim().length > 0) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
      }
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length < 5) continue;

      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: statement })
        });

        if (response.ok) {
          successCount++;
          if (statement.includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE.*?\s+(\w+)\s*\(/is)?.[1];
            console.log(`   ✅ Created table: ${tableName}`);
          } else if (statement.includes('CREATE INDEX')) {
            const indexName = statement.match(/CREATE INDEX.*?\s+(\w+)\s+ON/is)?.[1];
            console.log(`   ✅ Created index: ${indexName}`);
          } else if (statement.includes('CREATE TRIGGER')) {
            const triggerName = statement.match(/CREATE TRIGGER\s+(\w+)\s/is)?.[1];
            console.log(`   ✅ Created trigger: ${triggerName}`);
          } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
            console.log(`   ✅ Created function: update_updated_at_column`);
          } else if (statement.includes('DROP TRIGGER')) {
            // Silently ignore drop trigger messages
          } else {
             console.log(`   ✅ Executed statement successfully`);
          }
        } else {
          const error = await response.text();
          if (error.includes('already exists')) {
            skipCount++;
            console.log(`   ⚠️  Skipped (already exists)`);
          } else if (error.includes('does not exist') && statement.includes('DROP')) {
             // Ignored
          } else {
            errorCount++;
            console.log(`   ❌ Error: ${error.substring(0, 100)}...`);
            console.log(`      Failed Query: ${statement.substring(0, 100)}...`);
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
      'employees',
      'clients',
      'partners',
      'payroll',
      'finance',
      'compliance',
      'attendance',
      'leave_requests',
      'expense_claims',
      'client_invoices'
    ];

    let verifiedCount = 0;
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        
        if (!error) {
          console.log(`   ✅ ${table}`);
          verifiedCount++;
        } else {
          console.log(`   ❌ ${table} - Not accessible (${error.message})`);
        }
      } catch (err) {
        console.log(`   ❌ ${table} - ${err.message}`);
      }
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ DATABASE SETUP COMPLETE! ✅                      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Tables Verified: ${verifiedCount} / ${tables.length}\n`);

    if (verifiedCount === tables.length) {
      console.log('🎉 SUCCESS! All tables created successfully!\n');
    } else {
      console.log('⚠️  Some tables may need manual creation.');
      console.log('   Please check Supabase Dashboard > SQL Editor\n');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupSupabaseAll();
