require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function compare() {
  console.log('📊 LOCAL DATABASE COUNTS:');
  const tables = ['employees', 'clients', 'partners', 'job_openings', 'candidates'];
  
  for (const table of tables) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count} records`);
    }
  }
}

compare();
