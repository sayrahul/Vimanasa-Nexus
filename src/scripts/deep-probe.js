require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Simulate the route.js environment
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function probe() {
  console.log('📡 Probing Database with Admin Credentials...');
  
  const tables = ['job_openings', 'candidates'];
  
  for (const table of tables) {
    const { data, error, count } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact' });
      
    if (error) {
      console.error(`❌ ${table} Error:`, error.message);
    } else {
      console.log(`✅ ${table}: Found ${count} records`);
      if (count > 0) {
        console.log(`   Sample: ${data[0].title || data[0].full_name}`);
      }
    }
  }
}

probe();
