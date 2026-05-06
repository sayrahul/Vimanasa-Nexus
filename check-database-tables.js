/**
 * Check what tables exist in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('\n🔍 Checking Database Tables...\n');

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
    'client_invoices',
    'salary_advances',
    'employee_loans',
    'payroll_history',
    'tax_declarations',
    'bank_transfer_batches'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(25)} - ERROR: ${error.message}`);
      } else {
        console.log(`✅ ${table.padEnd(25)} - EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(25)} - ERROR: ${err.message}`);
    }
  }

  console.log('\n✅ Database check complete!\n');
}

checkTables();
