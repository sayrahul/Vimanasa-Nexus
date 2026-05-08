require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
  const { data: jobs } = await supabase.from('job_openings').select('title, status');
  console.log('--- CURRENT JOBS IN DB ---');
  jobs.forEach((j, i) => {
    console.log(`${i+1}. ${j.title} [${j.status}]`);
  });
  console.log('--------------------------');
}

listAll();
