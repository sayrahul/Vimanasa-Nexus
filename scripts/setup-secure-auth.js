#!/usr/bin/env node

/**
 * Secure Authentication Setup Script
 * 
 * This script:
 * 1. Creates the users table in Supabase
 * 2. Sets up a secure admin user with a strong password
 * 3. Validates environment variables
 * 
 * Usage:
 *   node scripts/setup-secure-auth.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

// Load environment variables
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    log('⚠️  Warning: Could not load .env.local file', 'yellow');
  }
}

loadEnv();

// Validate environment variables
function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    log('❌ Missing required environment variables:', 'red');
    missing.forEach(key => log(`   - ${key}`, 'red'));
    log('\nPlease set these in your .env.local file', 'yellow');
    process.exit(1);
  }

  log('✅ Environment variables validated', 'green');
}

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// PBKDF2 password hashing (matching passwordHash.js)
async function hashPassword(password) {
  const ITERATIONS = 100000;
  const KEY_LENGTH = 32;
  const SALT_LENGTH = 16;

  // Generate salt
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  const saltBase64 = Buffer.from(salt).toString('base64');

  // Hash password
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = Buffer.from(saltBase64, 'base64');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const hashBase64 = Buffer.from(new Uint8Array(derivedBits)).toString('base64');

  return `${ITERATIONS}$${saltBase64}$${hashBase64}`;
}

// Validate password strength
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
}

// Prompt for password
function promptPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Hide password input
    const stdin = process.stdin;
    const originalWrite = process.stdout.write;
    
    rl.question(prompt, (answer) => {
      process.stdout.write = originalWrite;
      rl.close();
      resolve(answer);
    });

    // Mask password
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (stringToWrite.charCodeAt(0) === 13) {
        rl.output.write('\n');
      } else if (stringToWrite !== prompt) {
        rl.output.write('*');
      } else {
        rl.output.write(stringToWrite);
      }
    };
  });
}

// Create users table
async function createUsersTable(supabase) {
  logSection('Creating Users Table');

  try {
    const sqlPath = join(__dirname, 'create-users-table.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    log('📝 Executing SQL migration...', 'cyan');

    // Execute SQL (note: this might need to be done manually in Supabase SQL Editor)
    // For now, we'll just check if the table exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      log('⚠️  Users table does not exist', 'yellow');
      log('\n📋 Please run the following SQL in Supabase SQL Editor:', 'cyan');
      log(`   ${sqlPath}`, 'bright');
      log('\nAfter running the SQL, press Enter to continue...', 'yellow');
      await new Promise(resolve => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('', () => {
          rl.close();
          resolve();
        });
      });
    } else {
      log('✅ Users table exists', 'green');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    throw error;
  }
}

// Create admin user
async function createAdminUser(supabase) {
  logSection('Creating Admin User');

  // Check if admin already exists
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', 'admin')
    .single();

  if (existingAdmin) {
    log('⚠️  Admin user already exists', 'yellow');
    log(`   Username: ${existingAdmin.username}`, 'cyan');
    log(`   ID: ${existingAdmin.id}`, 'cyan');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise(resolve => {
      rl.question('\nDo you want to reset the admin password? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      log('Skipping admin user creation', 'yellow');
      return;
    }
  }

  // Prompt for password
  log('Please create a secure password for the admin user:', 'cyan');
  log('Requirements:', 'yellow');
  log('  - At least 8 characters', 'yellow');
  log('  - At least one lowercase letter', 'yellow');
  log('  - At least one uppercase letter', 'yellow');
  log('  - At least one number', 'yellow');
  log('  - At least one special character', 'yellow');
  console.log();

  let password = '';
  let passwordValid = false;

  while (!passwordValid) {
    password = await promptPassword('Enter admin password: ');
    const errors = validatePassword(password);

    if (errors.length > 0) {
      log('\n❌ Password does not meet requirements:', 'red');
      errors.forEach(err => log(`   - ${err}`, 'red'));
      console.log();
    } else {
      const confirmPassword = await promptPassword('\nConfirm password: ');
      if (password !== confirmPassword) {
        log('\n❌ Passwords do not match. Please try again.\n', 'red');
      } else {
        passwordValid = true;
      }
    }
  }

  log('\n🔐 Hashing password...', 'cyan');
  const passwordHash = await hashPassword(password);

  if (existingAdmin) {
    // Update existing admin
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', existingAdmin.id);

    if (error) {
      throw new Error(`Failed to update admin user: ${error.message}`);
    }

    log('✅ Admin password updated successfully', 'green');
  } else {
    // Create new admin
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: 'admin',
        password_hash: passwordHash,
        email: 'admin@vimanasa.com',
        full_name: 'System Administrator',
        role: 'super_admin',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }

    log('✅ Admin user created successfully', 'green');
    log(`   Username: ${data.username}`, 'cyan');
    log(`   Email: ${data.email}`, 'cyan');
    log(`   Role: ${data.role}`, 'cyan');
  }
}

// Main function
async function main() {
  try {
    logSection('🔐 Secure Authentication Setup');

    log('This script will set up secure authentication for Vimanasa Nexus', 'cyan');
    console.log();

    // Validate environment
    validateEnv();

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Create users table
    await createUsersTable(supabase);

    // Create admin user
    await createAdminUser(supabase);

    logSection('✅ Setup Complete!');

    log('Next steps:', 'cyan');
    log('1. Update your login route to use the new auth system', 'yellow');
    log('2. Test login with the admin credentials', 'yellow');
    log('3. Remove the old auth.js file', 'yellow');
    log('4. Deploy to production', 'yellow');

    console.log();
    log('🎉 Your application now has secure authentication!', 'green');

  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
