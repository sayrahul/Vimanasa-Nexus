/**
 * Check table structures
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStructure() {
  console.log('\n🔍 Checking Table Structures...\n');

  const tables = ['employees', 'clients', 'partners', 'payroll'];

  for (const table of tables) {
    try {
      // Try to insert and immediately delete a test record to see what columns are required
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`\n❌ ${table}:`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`\n✅ ${table}:`);
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        } else {
          console.log(`   Table exists but is empty - trying to get structure...`);
          
          // Get table info from information_schema
          const { data: columns, error: colError } = await supabase
            .rpc('get_table_columns', { table_name: table })
            .catch(() => ({ data: null, error: 'RPC not available' }));
          
          if (columns) {
            console.log(`   Columns: ${columns.map(c => c.column_name).join(', ')}`);
          } else {
            console.log(`   Cannot determine structure (table is empty)`);
          }
        }
      }
    } catch (err) {
      console.log(`\n❌ ${table}:`);
      console.log(`   Error: ${err.message}`);
    }
  }

  console.log('\n✅ Structure check complete!\n');
}

checkStructure();
