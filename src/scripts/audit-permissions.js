require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function audit() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🛡️ PERMISSIONS AUDIT:');
  
  const tables = ['employees', 'clients', 'job_openings', 'candidates'];
  
  for (const table of tables) {
    console.log(`\n--- Table: ${table} ---`);
    
    // 1. Test with Anon Key (What a random visitor sees)
    const publicClient = createClient(supabaseUrl, anonKey);
    const { count: pubCount } = await publicClient.from(table).select('*', { count: 'exact', head: true });
    console.log(`🔓 Public View: ${pubCount ?? 0} records visible`);
    
    // 2. Test with Service Key (What the Admin should see)
    if (serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey);
      const { count: admCount } = await adminClient.from(table).select('*', { count: 'exact', head: true });
      console.log(`🔐 Admin View: ${admCount ?? 0} records visible`);
    } else {
      console.log('⚠️ No Service Key found locally!');
    }
  }
}

audit();
