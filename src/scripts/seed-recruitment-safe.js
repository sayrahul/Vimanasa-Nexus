require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchemaAndSeed() {
  console.log('🔍 Checking and Seeding Job Openings...');
  
  // Try to insert with a safer set of columns first
  const jobs = [
    {
      id: 'JOB-SEC-001',
      title: 'Senior Security Supervisor',
      department: 'Operations',
      location: 'Pune, Maharashtra',
      type: 'Full-time',
      description: 'Looking for an experienced security supervisor to manage a team of 50+ guards at a premium residential site.',
      requirements: '5+ years experience, Ex-servicemen preferred, Leadership skills',
      status: 'open'
    },
    {
      id: 'JOB-CCTV-002',
      title: 'CCTV Monitoring Expert',
      department: 'Surveillance',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      description: 'Require a sharp-eyed professional for 24/7 surveillance monitoring and incident reporting.',
      requirements: 'Technical knowledge of IP cameras, Basic computer skills, 12th pass',
      status: 'open'
    }
  ];

  const { error: jobError } = await supabase.from('job_openings').upsert(jobs);
  if (jobError) {
    console.error('Error seeding jobs:', jobError.message);
  } else {
    console.log('✅ Basic Job Openings seeded!');
  }

  console.log('🔍 Checking and Seeding Candidates...');
  
  // Use column names that are guaranteed to exist or be compatible
  const candidates = [
    {
      'Full Name': 'Amit Sharma',
      'Email': 'amit.sharma@example.com',
      'Phone': '9876543210',
      'Job Title': 'Senior Security Supervisor',
      'Job ID': 'JOB-SEC-001',
      'Status': 'shortlisted',
      'Experience': '6 Years'
    }
  ];

  const { error: candError } = await supabase.from('candidates').upsert(candidates);
  if (candError) {
    console.error('Error seeding candidates:', candError.message);
  } else {
    console.log('✅ Basic Candidates seeded!');
  }

  console.log('🚀 Data Injection Attempt Finished!');
}

fixSchemaAndSeed();
