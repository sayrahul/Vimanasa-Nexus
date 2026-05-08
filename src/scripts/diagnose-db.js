require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('------------------------------------');
  console.log('🔍 DATABASE DIAGNOSTIC');
  console.log('URL:', supabaseUrl);
  console.log('------------------------------------');

  // Check Job Openings
  const { data: jobs, error: jobError } = await supabase.from('job_openings').select('*');
  if (jobError) console.error('❌ Job Openings Error:', jobError.message);
  else console.log(`✅ Job Openings Found: ${jobs.length} records`);

  // Check Candidates
  const { data: candidates, error: candError } = await supabase.from('candidates').select('*');
  if (candError) console.error('❌ Candidates Error:', candError.message);
  else console.log(`✅ Candidates Found: ${candidates.length} records`);

  if (jobs.length > 0) {
    console.log('Sample Job Title:', jobs[0].title || jobs[0]['Job Title']);
  }

  console.log('------------------------------------');
}

diagnose();
