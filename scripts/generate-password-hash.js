#!/usr/bin/env node

/**
 * Password Hash Generator
 * 
 * This utility generates secure password hashes for the users table.
 * Use this to create password hashes for seeding users or resetting passwords.
 * 
 * Usage:
 *   node scripts/generate-password-hash.js
 *   node scripts/generate-password-hash.js "MySecurePassword123!"
 */

import { hashPassword, validatePasswordStrength } from '../src/lib/passwordHash.js';
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

async function generateHash(password) {
  console.log('\n🔐 Validating password strength...');
  
  const validation = validatePasswordStrength(password);
  
  if (!validation.valid) {
    console.log('\n❌ Password validation failed:');
    validation.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
    console.log('\n📋 Password Requirements:');
    console.log('   - At least 8 characters long');
    console.log('   - Contains uppercase letter (A-Z)');
    console.log('   - Contains lowercase letter (a-z)');
    console.log('   - Contains number (0-9)');
    console.log('   - Contains special character (!@#$%^&*...)');
    console.log('   - Not a common weak password');
    return false;
  }
  
  console.log('✅ Password meets security requirements\n');
  console.log('🔄 Generating secure hash (this may take a moment)...');
  
  const hash = await hashPassword(password);
  
  console.log('\n✅ Password hash generated successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Copy this hash to your SQL script or environment variable:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(hash);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📝 Example SQL usage:');
  console.log(`
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES (
  'username',
  'user@example.com',
  '${hash}',
  'Full Name',
  'role'
);
`);
  
  console.log('⚠️  SECURITY REMINDERS:');
  console.log('   - Never commit this hash to version control');
  console.log('   - Store it securely in your password manager');
  console.log('   - Use environment variables for production');
  console.log('   - Rotate passwords regularly\n');
  
  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🔐 Secure Password Hash Generator 🔐              ║');
  console.log('║                                                            ║');
  console.log('║  Generate PBKDF2-SHA256 password hashes for user table    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Check if password provided as command line argument
  const password = process.argv[2];
  
  if (password) {
    await generateHash(password);
    rl.close();
    return;
  }
  
  // Interactive mode
  console.log('📝 Enter a password to hash (or press Ctrl+C to exit)\n');
  
  while (true) {
    const input = await question('Password: ');
    
    if (!input || input.trim() === '') {
      console.log('❌ Password cannot be empty\n');
      continue;
    }
    
    const success = await generateHash(input);
    
    if (success) {
      const another = await question('\nGenerate another hash? (y/n): ');
      if (another.toLowerCase() !== 'y') {
        break;
      }
      console.log('\n' + '─'.repeat(60) + '\n');
    } else {
      const retry = await question('\nTry again? (y/n): ');
      if (retry.toLowerCase() !== 'y') {
        break;
      }
      console.log('\n' + '─'.repeat(60) + '\n');
    }
  }
  
  console.log('\n👋 Goodbye!\n');
  rl.close();
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
