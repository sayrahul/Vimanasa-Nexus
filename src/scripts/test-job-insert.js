require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🧪 Testing Job Insert (Simulation)...');
  
  const jobData = {
    title: 'Manual Test Job',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary_range: '₹50k - ₹80k',
    description: 'Testing if this works without manual ID.',
    requirements: 'None',
    status: 'open'
  };

  const { error } = await supabase.from('job_openings').insert([jobData]);
  
  if (error) {
    console.error('❌ Insert Failed:', error.message);
    if (error.message.includes('null value in column "id"')) {
      console.log('💡 CONFIRMED: Column "id" needs a manual UUID.');
    }
  } else {
    console.log('✅ Insert worked! (Wait, so why does it fail on frontend?)');
  }
}

testInsert();
