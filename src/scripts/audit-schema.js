require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
  console.log('🔍 Auditing job_openings table...');
  
  // Try to fetch a single record to see its columns
  const { data, error } = await supabase.from('job_openings').select('*').limit(1);
  
  if (error) {
    console.error('❌ Audit Error:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Found Columns:', Object.keys(data[0]).join(', '));
  } else {
    console.log('⚠️ No records found to detect columns.');
    
    // Fallback: Try a dummy insert to see what fails
    console.log('🧪 Testing dummy insert...');
    const { error: insertError } = await supabase.from('job_openings').insert({
      title: 'Audit Test',
      status: 'open'
    });
    
    if (insertError) {
      console.log('❌ Insert Failed. Reason:', insertError.message);
    } else {
      console.log('✅ Basic insert works!');
    }
  }
}

audit();
