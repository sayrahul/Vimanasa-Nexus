#!/usr/bin/env node

/**
 * Quick Setup Script - Create Users Table and Seed Admin
 * 
 * This script automates the entire setup process:
 * 1. Generates secure password hashes
 * 2. Creates the users table in Supabase
 * 3. Seeds the admin user
 * 
 * Usage: node scripts/quick-setup-users.js
 */

import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '../src/lib/passwordHash.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('Make sure .env.local has:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTableExists() {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(1);
  
  return !error || !error.message?.includes('relation "users" does not exist');
}

async function createUsersTable() {
  console.log('\n📋 Creating users table...');
  
  const sql = `
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'employee',
      is_active BOOLEAN DEFAULT true,
      is_locked BOOLEAN DEFAULT false,
      failed_login_attempts INTEGER DEFAULT 0,
      last_login_at TIMESTAMP,
      last_login_ip VARCHAR(45),
      password_changed_at TIMESTAMP DEFAULT NOW(),
      must_change_password BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      created_by UUID,
      updated_by UUID,
      
      CONSTRAINT valid_role CHECK (role IN (
        'super_admin', 'admin', 'hr_manager', 'finance_manager', 'compliance_officer', 'employee'
      ))
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    -- Create user_permissions table
    CREATE TABLE IF NOT EXISTS user_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      permission VARCHAR(100) NOT NULL,
      granted_at TIMESTAMP DEFAULT NOW(),
      granted_by UUID REFERENCES users(id),
      UNIQUE(user_id, permission)
    );

    -- Create audit_logs table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      username VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(100),
      resource_id UUID,
      ip_address VARCHAR(45),
      user_agent TEXT,
      status VARCHAR(20) NOT NULL,
      details JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
  `;

  // Execute via RPC or direct SQL
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => ({ error: null }));
  
  if (error) {
    console.log('⚠️  Note: Table creation via RPC not available. Please run SQL manually.');
    console.log('📝 Copy and paste this SQL into Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60) + '\n');
    
    const proceed = await question('Have you run the SQL in Supabase? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('❌ Setup cancelled. Please run the SQL first.');
      process.exit(1);
    }
  } else {
    console.log('✅ Users table created successfully!');
  }
}

async function seedAdminUser(username, password, email, fullName) {
  console.log('\n🔐 Generating secure password hash...');
  const passwordHash = await hashPassword(password);
  
  console.log('👤 Creating admin user...');
  
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', username)
    .single();
  
  if (existingUser) {
    console.log(`⚠️  User "${username}" already exists. Updating password...`);
    
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        email,
        full_name: fullName,
        is_active: true,
        is_locked: false,
        failed_login_attempts: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('username', username);
    
    if (error) {
      console.error('❌ Error updating user:', error.message);
      return false;
    }
    
    console.log('✅ User updated successfully!');
    return true;
  }
  
  // Create new user
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: 'super_admin',
      is_active: true,
      is_locked: false,
      must_change_password: false,
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error creating user:', error.message);
    return false;
  }
  
  // Add permissions
  await supabase
    .from('user_permissions')
    .insert({
      user_id: data.id,
      permission: '*',
    });
  
  console.log('✅ Admin user created successfully!');
  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🚀 Quick Setup - Users & Authentication           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Check if table exists
  const tableExists = await checkTableExists();
  
  if (!tableExists) {
    console.log('📋 Users table does not exist. Creating...\n');
    await createUsersTable();
  } else {
    console.log('✅ Users table already exists\n');
  }
  
  // Get admin credentials
  console.log('📝 Let\'s create your admin user:\n');
  
  const username = await question('Username (default: admin): ') || 'admin';
  const email = await question('Email (default: admin@vimanasa.com): ') || 'admin@vimanasa.com';
  const fullName = await question('Full Name (default: System Administrator): ') || 'System Administrator';
  
  console.log('\n🔐 Enter a secure password:');
  console.log('   - Minimum 8 characters');
  console.log('   - Mix of uppercase, lowercase, numbers, symbols\n');
  
  const password = await question('Password: ');
  
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    rl.close();
    process.exit(1);
  }
  
  // Create admin user
  const success = await seedAdminUser(username, password, email, fullName);
  
  if (success) {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Setup Complete!');
    console.log('='.repeat(60));
    console.log('\n📝 Your Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}`);
    console.log('\n⚠️  IMPORTANT: Store these credentials securely!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Login with your credentials');
    console.log('\n✅ You\'re all set!\n');
  } else {
    console.error('\n❌ Setup failed. Please check the errors above.');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
