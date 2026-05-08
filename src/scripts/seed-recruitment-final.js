require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalSeed() {
  console.log('🔍 Injecting Schema-Aligned Data...');
  
  const jobId1 = crypto.randomUUID();
  const jobId2 = crypto.randomUUID();

  // Create jobs with snake_case columns as expected by DB
  const jobs = [
    {
      id: jobId1,
      title: 'Senior Security Supervisor',
      department: 'Operations',
      location: 'Pune, Maharashtra',
      type: 'Full-time',
      salary_range: '₹25,000 - ₹35,000',
      description: 'Looking for an experienced security supervisor to manage a team of 50+ guards at a premium residential site.',
      requirements: '5+ years experience, Ex-servicemen preferred, Leadership skills',
      status: 'open'
    },
    {
      id: jobId2,
      title: 'Facility Manager',
      department: 'Management',
      location: 'Bangalore, Karnataka',
      type: 'Full-time',
      salary_range: '₹45,000 - ₹60,000',
      description: 'Lead facility management operations for a corporate tech park.',
      requirements: 'MBA in Operations or equivalent, 8+ years experience in FM',
      status: 'open'
    }
  ];

  const { error: jobError } = await supabase.from('job_openings').insert(jobs);
  if (jobError) console.error('Job Error:', jobError.message);
  else console.log('✅ Job Openings injected!');

  // Create candidates with snake_case columns
  const candidates = [
    {
      id: crypto.randomUUID(),
      full_name: 'Amit Sharma',
      email: 'amit.sharma@example.com',
      phone: '9876543210',
      job_title: 'Senior Security Supervisor',
      job_id: jobId1,
      status: 'shortlisted',
      total_experience_years: 6,
      current_employer: 'Delta Security Services',
      skills: 'Security Management, Fire Safety, First Aid'
    },
    {
      id: crypto.randomUUID(),
      full_name: 'Priya Deshmukh',
      email: 'priya.d@example.com',
      phone: '8877665544',
      job_title: 'Facility Manager',
      job_id: jobId2,
      status: 'pending',
      total_experience_years: 3,
      current_employer: 'SafeWatch Systems',
      skills: 'Facility Management, Team Leadership'
    }
  ];

  const { error: candError } = await supabase.from('candidates').insert(candidates);
  if (candError) console.error('Candidate Error:', candError.message);
  else console.log('✅ Sample Candidates injected!');

  console.log('🚀 Mission Accomplished! Data is now Live.');
}

finalSeed();
