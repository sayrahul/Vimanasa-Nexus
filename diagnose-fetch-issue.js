#!/usr/bin/env node

/**
 * Vimanasa Nexus - Fetch Data Diagnostic Tool
 * 
 * This script helps diagnose "Unable to fetch data" issues
 * by checking database connectivity and table existence.
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Required tables for the application
const REQUIRED_TABLES = [
  'employees',
  'clients',
  'partners',
  'attendance',
  'leave_requests',
  'expense_claims',
  'payroll',
  'finance',
  'client_invoices',
  'compliance'
];

async function makeSupabaseRequest(table, useServiceKey = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    url.searchParams.append('select', 'count');
    url.searchParams.append('limit', '1');

    const options = {
      method: 'GET',
      headers: {
        'apikey': useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${useServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const count = res.headers['content-range']?.split('/')[1] || '0';
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            count: parseInt(count),
            data: data ? JSON.parse(data) : null
          });
        } catch (error) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            error: error.message,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function checkEnvironmentVariables() {
  logSection('🔍 STEP 1: Checking Environment Variables');

  const checks = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SUPABASE_SERVICE_KEY }
  ];

  let allConfigured = true;

  for (const check of checks) {
    if (check.value) {
      logSuccess(`${check.name}: Configured`);
      if (check.name.includes('URL')) {
        logInfo(`   URL: ${check.value}`);
      } else {
        logInfo(`   Key: ${check.value.substring(0, 20)}...`);
      }
    } else {
      logError(`${check.name}: Missing`);
      allConfigured = false;
    }
  }

  if (!allConfigured) {
    logError('\n❌ Environment variables are not properly configured!');
    logInfo('Please check your .env.local file');
    return false;
  }

  logSuccess('\n✅ All environment variables are configured');
  return true;
}

async function checkSupabaseConnection() {
  logSection('🔍 STEP 2: Testing Supabase Connection');

  try {
    // Try to connect to Supabase REST API
    const response = await makeSupabaseRequest('employees');
    
    if (response.success) {
      logSuccess('Supabase connection successful');
      logInfo(`Status Code: ${response.statusCode}`);
      return true;
    } else {
      logError('Supabase connection failed');
      logInfo(`Status Code: ${response.statusCode}`);
      if (response.data) {
        logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
      }
      return false;
    }
  } catch (error) {
    logError(`Connection error: ${error.message}`);
    return false;
  }
}

async function checkTables() {
  logSection('🔍 STEP 3: Checking Database Tables');

  const results = {
    existing: [],
    missing: [],
    withData: [],
    empty: []
  };

  for (const table of REQUIRED_TABLES) {
    try {
      const response = await makeSupabaseRequest(table, true);
      
      if (response.success) {
        results.existing.push(table);
        if (response.count > 0) {
          results.withData.push({ table, count: response.count });
          logSuccess(`${table.padEnd(20)} - Exists (${response.count} records)`);
        } else {
          results.empty.push(table);
          logWarning(`${table.padEnd(20)} - Exists (0 records)`);
        }
      } else {
        results.missing.push(table);
        logError(`${table.padEnd(20)} - Missing or inaccessible`);
      }
    } catch (error) {
      results.missing.push(table);
      logError(`${table.padEnd(20)} - Error: ${error.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

async function generateReport(tableResults) {
  logSection('📊 DIAGNOSTIC REPORT');

  const totalTables = REQUIRED_TABLES.length;
  const existingCount = tableResults.existing.length;
  const missingCount = tableResults.missing.length;
  const withDataCount = tableResults.withData.length;
  const emptyCount = tableResults.empty.length;

  log(`\nTotal Required Tables: ${totalTables}`, 'bold');
  log(`✅ Existing Tables: ${existingCount}`, existingCount === totalTables ? 'green' : 'yellow');
  log(`❌ Missing Tables: ${missingCount}`, missingCount > 0 ? 'red' : 'green');
  log(`📊 Tables with Data: ${withDataCount}`, 'cyan');
  log(`📭 Empty Tables: ${emptyCount}`, 'yellow');

  if (missingCount > 0) {
    logSection('❌ MISSING TABLES');
    tableResults.missing.forEach(table => {
      logError(`  • ${table}`);
    });
  }

  if (emptyCount > 0) {
    logSection('📭 EMPTY TABLES (No Data)');
    tableResults.empty.forEach(table => {
      logWarning(`  • ${table}`);
    });
  }

  if (withDataCount > 0) {
    logSection('✅ TABLES WITH DATA');
    tableResults.withData.forEach(({ table, count }) => {
      logSuccess(`  • ${table}: ${count} records`);
    });
  }

  logSection('🎯 DIAGNOSIS & SOLUTION');

  if (missingCount > 0) {
    logError('\n❌ PROBLEM IDENTIFIED: Missing Database Tables');
    log('\nYour dashboard is showing "Failed to fetch data" because', 'yellow');
    log('the required database tables do not exist in Supabase.', 'yellow');
    
    log('\n📝 SOLUTION:', 'cyan');
    log('1. Open the file: FETCH_DATA_FIX.md', 'white');
    log('2. Follow the instructions to create all tables', 'white');
    log('3. Run the SQL script in Supabase SQL Editor', 'white');
    log('4. Refresh your dashboard', 'white');
    
    log('\n🚀 Quick Fix:', 'green');
    log('Run this command to open the fix guide:', 'white');
    log('   cat FETCH_DATA_FIX.md', 'cyan');
  } else if (emptyCount === totalTables) {
    logWarning('\n⚠️  PROBLEM IDENTIFIED: All Tables Are Empty');
    log('\nYour tables exist but have no data.', 'yellow');
    
    log('\n📝 SOLUTION:', 'cyan');
    log('1. The SQL script in FETCH_DATA_FIX.md includes sample data', 'white');
    log('2. Run the script to insert sample data', 'white');
    log('3. Or use the dashboard UI to add your own data', 'white');
  } else {
    logSuccess('\n✅ DATABASE IS PROPERLY CONFIGURED!');
    log('\nIf you\'re still seeing "Failed to fetch data" errors:', 'yellow');
    log('1. Clear your browser cache (Ctrl+Shift+R)', 'white');
    log('2. Check browser console for errors (F12)', 'white');
    log('3. Verify your app is using the correct Supabase URL', 'white');
    log('4. Check if Row Level Security (RLS) is blocking access', 'white');
  }

  logSection('📚 ADDITIONAL RESOURCES');
  log('• Fix Guide: FETCH_DATA_FIX.md', 'cyan');
  log('• Database Setup: PAYROLL_DATABASE_SETUP.md', 'cyan');
  log('• Comprehensive Plan: COMPREHENSIVE_IMPROVEMENT_PLAN.md', 'cyan');
  
  console.log('\n');
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     VIMANASA NEXUS - FETCH DATA DIAGNOSTIC TOOL           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  // Step 1: Check environment variables
  const envConfigured = await checkEnvironmentVariables();
  if (!envConfigured) {
    logError('\n❌ Cannot proceed without proper environment configuration');
    process.exit(1);
  }

  // Step 2: Check Supabase connection
  const connected = await checkSupabaseConnection();
  if (!connected) {
    logError('\n❌ Cannot connect to Supabase. Please check your credentials.');
    process.exit(1);
  }

  // Step 3: Check tables
  const tableResults = await checkTables();

  // Step 4: Generate report
  await generateReport(tableResults);

  // Exit code based on results
  if (tableResults.missing.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run the diagnostic
main().catch(error => {
  logError(`\n❌ Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
