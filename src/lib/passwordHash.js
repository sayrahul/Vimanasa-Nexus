/**
 * Secure Password Hashing Utility
 * Uses PBKDF2 with SHA-256 (Web Crypto API - Edge Runtime Compatible)
 * 
 * This implementation is secure and works in:
 * - Node.js
 * - Edge Runtime (Vercel, Cloudflare Workers)
 * - Browser environments
 */

const ITERATIONS = 100000; // OWASP recommended minimum
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

// Support for both Browser/Edge and Node.js environments
const getCrypto = () => {
  if (typeof crypto !== 'undefined') return crypto;
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  try {
    return require('crypto').webcrypto;
  } catch (e) {
    try {
      return require('crypto');
    } catch (e2) {
      return null;
    }
  }
};

const _crypto = getCrypto();

/**
 * Generate a random salt
 * @returns {Promise<string>} Base64-encoded salt
 */
async function generateSalt() {
  const salt = new Uint8Array(SALT_LENGTH);
  _crypto.getRandomValues(salt);
  return arrayBufferToBase64(salt);
}

/**
 * Hash a password using PBKDF2-SHA256
 * @param {string} password - Plain text password
 * @param {string} [salt] - Optional salt (generates new one if not provided)
 * @returns {Promise<string>} Hash in format: iterations$salt$hash
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const salt = await generateSalt();
  const hash = await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH);
  
  // Format: iterations$salt$hash
  return `${ITERATIONS}$${salt}$${hash}`;
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Stored hash in format: iterations$salt$hash
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) {
    return false;
  }

  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3) {
      return false;
    }

    const [iterationsStr, salt, hash] = parts;
    const iterations = parseInt(iterationsStr, 10);

    if (isNaN(iterations) || iterations < 1000) {
      return false;
    }

    const computedHash = await pbkdf2(password, salt, iterations, KEY_LENGTH);
    
    // Constant-time comparison to prevent timing attacks
    return constantTimeEqual(hash, computedHash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * PBKDF2 implementation using Web Crypto API
 * @param {string} password
 * @param {string} salt - Base64-encoded salt
 * @param {number} iterations
 * @param {number} keyLength - Length in bytes
 * @returns {Promise<string>} Base64-encoded hash
 */
async function pbkdf2(password, salt, iterations, keyLength) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = base64ToArrayBuffer(salt);

  // Import password as key material
  const keyMaterial = await _crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await _crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    keyLength * 8 // Convert bytes to bits
  );

  return arrayBufferToBase64(new Uint8Array(derivedBits));
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function constantTimeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 * @param {string} base64
 * @returns {Uint8Array}
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
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

  // Check for common weak passwords
  const weakPasswords = [
    'password', 'Password1', '12345678', 'qwerty123', 'admin123',
    'letmein', 'welcome', 'monkey', '1234567890', 'password123'
  ];

  if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
    errors.push('Password is too common or weak');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @returns {string} Random password
 */
export function generateSecurePassword(length = 16) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + special;

  const array = new Uint8Array(length);
  _crypto.getRandomValues(array);

  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[array[0] % lowercase.length];
  password += uppercase[array[1] % uppercase.length];
  password += numbers[array[2] % numbers.length];
  password += special[array[3] % special.length];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if a hash needs to be rehashed (e.g., iterations increased)
 * @param {string} storedHash
 * @returns {boolean}
 */
export function needsRehash(storedHash) {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3) {
      return true;
    }

    const iterations = parseInt(parts[0], 10);
    return iterations < ITERATIONS;
  } catch {
    return true;
  }
}
