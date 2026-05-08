require('dotenv').config({ path: '.env.local' });

async function stressTest() {
  const apiUrl = `http://localhost:3000/api/database`;
  console.log('🚀 Starting API Stress Test (Built-in Fetch)...');
  console.log('URL:', apiUrl);

  const testJob = {
    title: 'STRESS TEST JOB',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary_range: '₹10L - ₹15L',
    description: 'Stress testing the API insertion.',
    requirements: 'Testing',
    status: 'open'
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table: 'job_openings',
        data: testJob
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API Request Succeeded!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ API Request FAILED!');
      console.error('Status:', response.status);
      console.error('Error Details:', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error('❌ Network Error:', err.message);
  }
}

stressTest();
