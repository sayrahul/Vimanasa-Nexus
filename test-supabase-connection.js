const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Testing Supabase Connection\n');
console.log('═'.repeat(60));

console.log('\n📋 Configuration:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Anon Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 50) + '...' : 'NOT SET'}`);
console.log(`Service Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 50) + '...' : 'NOT SET'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ Error: Supabase credentials not configured properly');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('\n🧪 Testing Connection...\n');
  
  try {
    // Test 1: List tables
    console.log('Test 1: Fetching clients...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);
    
    if (clientsError) {
      console.log('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log(`✅ Success! Found ${clients.length} clients`);
      if (clients.length > 0) {
        console.log('   Sample:', clients[0]);
      }
    }
    
    // Test 2: Fetch partners
    console.log('\nTest 2: Fetching partners...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('*')
      .limit(5);
    
    if (partnersError) {
      console.log('❌ Error fetching partners:', partnersError.message);
    } else {
      console.log(`✅ Success! Found ${partners.length} partners`);
    }
    
    // Test 3: Fetch invoices
    console.log('\nTest 3: Fetching invoices...');
    const { data: invoices, error: invoicesError } = await supabase
      .from('client_invoices')
      .select('*')
      .limit(5);
    
    if (invoicesError) {
      console.log('❌ Error fetching invoices:', invoicesError.message);
    } else {
      console.log(`✅ Success! Found ${invoices.length} invoices`);
    }
    
    // Test 4: Fetch employees
    console.log('\nTest 4: Fetching employees...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(5);
    
    if (employeesError) {
      console.log('❌ Error fetching employees:', employeesError.message);
    } else {
      console.log(`✅ Success! Found ${employees.length} employees`);
    }
    
    console.log('\n═'.repeat(60));
    console.log('✅ Connection test complete!');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.log('\n❌ Connection test failed:', error.message);
    console.error(error);
  }
}

testConnection();
