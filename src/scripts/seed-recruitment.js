require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('🌱 Seeding Job Openings...');
  
  const jobs = [
    {
      id: 'JOB-SEC-001',
      title: 'Senior Security Supervisor',
      department: 'Operations',
      location: 'Pune, Maharashtra',
      type: 'Full-time',
      salary: '₹25,000 - ₹35,000',
      description: 'Looking for an experienced security supervisor to manage a team of 50+ guards at a premium residential site.',
      requirements: '5+ years experience, Ex-servicemen preferred, Leadership skills',
      status: 'open',
      created_at: new Date().toISOString()
    },
    {
      id: 'JOB-CCTV-002',
      title: 'CCTV Monitoring Expert',
      department: 'Surveillance',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      salary: '₹18,000 - ₹24,000',
      description: 'Require a sharp-eyed professional for 24/7 surveillance monitoring and incident reporting.',
      requirements: 'Technical knowledge of IP cameras, Basic computer skills, 12th pass',
      status: 'open',
      created_at: new Date().toISOString()
    },
    {
      id: 'JOB-MGR-003',
      title: 'Facility Manager',
      department: 'Management',
      location: 'Bangalore, Karnataka',
      type: 'Full-time',
      salary: '₹45,000 - ₹60,000',
      description: 'Lead facility management operations for a corporate tech park.',
      requirements: 'MBA in Operations or equivalent, 8+ years experience in FM',
      status: 'open',
      created_at: new Date().toISOString()
    }
  ];

  const { error: jobError } = await supabase.from('job_openings').upsert(jobs);
  if (jobError) console.error('Error seeding jobs:', jobError);
  else console.log('✅ Job Openings seeded!');

  console.log('🌱 Seeding Sample Candidates...');
  
  const candidates = [
    {
      'Full Name': 'Amit Sharma',
      'Email': 'amit.sharma@example.com',
      'Phone': '9876543210',
      'Job Title': 'Senior Security Supervisor',
      'Job ID': 'JOB-SEC-001',
      'Status': 'shortlisted',
      'Experience': '6 Years',
      'Current Employer': 'Delta Security Services',
      'Skills': 'Security Management, Fire Safety, First Aid',
      'created_at': new Date().toISOString()
    },
    {
      'Full Name': 'Priya Deshmukh',
      'Email': 'priya.d@example.com',
      'Phone': '8877665544',
      'Job Title': 'CCTV Monitoring Expert',
      'Job ID': 'JOB-CCTV-002',
      'Status': 'pending',
      'Experience': '2 Years',
      'Current Employer': 'SafeWatch Systems',
      'Skills': 'CCTV, Monitoring, Excel',
      'created_at': new Date().toISOString()
    }
  ];

  const { error: candError } = await supabase.from('candidates').upsert(candidates);
  if (candError) console.error('Error seeding candidates:', candError);
  else console.log('✅ Candidates seeded!');

  console.log('🚀 Data Injection Complete!');
}

seedData();
