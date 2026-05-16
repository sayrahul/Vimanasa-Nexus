/**
 * Secure Authentication System
 * Database-backed authentication with proper password hashing
 * Replaces the old hardcoded user system
 */

import { SignJWT, jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/passwordHash';

// JWT Secret - MUST be set in environment variables
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'CRITICAL: JWT_SECRET environment variable is not set. ' +
    'Application cannot start without a secure JWT secret. ' +
    'Please set JWT_SECRET in your environment variables.'
  );
}

const SECRET_KEY = new TextEncoder().encode(jwtSecret);

// Account lockout settings
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

/**
 * Authenticate user credentials against database
 * @param {string} username
 * @param {string} password
 * @param {Object} metadata - Optional metadata (IP, user agent, etc.)
 * @returns {Promise<Object|null>} User object without password or null
 */
export async function authenticateUser(username, password, metadata = {}) {
  if (!username || !password) {
    return null;
  }

  try {
    // Fetch user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      console.warn(`[Auth] User not found or inactive: ${username}`);
      // Log failed attempt for non-existent user
      await logAuthAttempt(null, username, false, 'User not found', metadata);
      return null;
    }

    // Check if account is locked
    const isLocked = user.is_locked || (user.locked_until && new Date(user.locked_until) > new Date());
    
    if (isLocked) {
      const lockMessage = user.locked_until 
        ? `Account locked for ${Math.ceil((new Date(user.locked_until) - new Date()) / 60000)} more minutes`
        : 'Account is locked';
        
      await logAuthAttempt(
        user.id,
        username,
        false,
        lockMessage,
        metadata
      );
      return null;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      console.warn(`[Auth] Invalid password for user: ${username}`);
      // Increment failed attempts
      await recordFailedLogin(user.id, username, metadata);
      return null;
    }

    console.log(`[Auth] Successful login for user: ${username}`);

    // Check if password needs rehashing (e.g., iterations increased)
    if (needsRehash(user.password_hash)) {
      const newHash = await hashPassword(password);
      await supabaseAdmin
        .from('users')
        .update({ password_hash: newHash })
        .eq('id', user.id);
    }

    // Record successful login
    await recordSuccessfulLogin(user, username, metadata);

    // Return user without sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Authentication error:', error);
    await logAuthAttempt(null, username, false, error.message, metadata);
    return null;
  }
}

/**
 * Create JWT token for authenticated user
 * @param {Object} user
 * @returns {Promise<string>} JWT token
 */
export async function createToken(user) {
  if (!SECRET_KEY) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .setSubject(user.id)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Promise<Object|null>} Decoded token payload or null
 */
export async function verifyToken(token) {
  try {
    if (!SECRET_KEY) {
      throw new Error('JWT_SECRET is not configured');
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

/**
 * Get user by ID from database
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getUserById(userId) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, full_name, role, is_active, last_login_at, created_at')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Get user by username from database
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
export async function getUserByUsername(username) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, full_name, role, is_active, last_login_at, created_at')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Create a new user (admin only)
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export async function createUser(userData) {
  const { username, password, email, full_name, role = 'employee' } = userData;

  if (!username || !password || !email || !full_name) {
    throw new Error('Missing required fields');
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Insert user
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({
      username,
      password_hash,
      email,
      full_name,
      role,
      is_active: true,
    })
    .select('id, username, email, full_name, role, is_active, created_at')
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return user;
}

/**
 * Update user password
 * @param {string} userId
 * @param {string} newPassword
 * @returns {Promise<boolean>}
 */
export async function updatePassword(userId, newPassword) {
  try {
    const password_hash = await hashPassword(newPassword);

    const { error } = await supabaseAdmin
      .from('users')
      .update({ password_hash })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    // Log password change
    await logAuthAttempt(userId, null, true, 'Password changed', {});

    return true;
  } catch (error) {
    console.error('Update password error:', error);
    return false;
  }
}

/**
 * Record successful login
 * @param {string} userId
 * @param {string} username
 * @param {Object} metadata
 */
async function recordSuccessfulLogin(user, username, metadata) {
  try {
    // Update user record
    const updateData = {
      last_login_at: new Date().toISOString(),
      failed_login_attempts: 0,
      is_locked: false,
    };
    
    // Only include locked_until if it exists in the schema
    // (We'll check this by seeing if it was in the user object we fetched)
    if ('locked_until' in user) {
      updateData.locked_until = null;
    }

    await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    // Log successful login
    await logAuthAttempt(user.id, username, true, 'Login successful', metadata);
  } catch (error) {
    console.error('Record successful login error:', error);
  }
}

/**
 * Record failed login attempt
 * @param {string} userId
 * @param {string} username
 * @param {Object} metadata
 */
async function recordFailedLogin(userId, username, metadata) {
  try {
    // Get current failed attempts
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('failed_login_attempts')
      .eq('id', userId)
      .single();

    const failedAttempts = (user?.failed_login_attempts || 0) + 1;
    const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;

    // Update user record
    const updateData = {
      failed_login_attempts: failedAttempts,
    };

    if (shouldLock) {
      updateData.is_locked = true;
      
      // Only include locked_until if it likely exists in the schema
      const { data: columnInfo } = await supabaseAdmin
        .from('users')
        .select('locked_until')
        .limit(1);
        
      if (columnInfo) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
        updateData.locked_until = lockUntil.toISOString();
      }
    }

    await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId);

    // Log failed attempt
    const errorMessage = shouldLock
      ? `Account locked after ${failedAttempts} failed attempts`
      : `Invalid password (attempt ${failedAttempts}/${MAX_FAILED_ATTEMPTS})`;

    await logAuthAttempt(userId, username, false, errorMessage, metadata);
  } catch (error) {
    console.error('Record failed login error:', error);
  }
}

/**
 * Log authentication attempt to audit log
 * @param {string|null} userId
 * @param {string} username
 * @param {boolean} success
 * @param {string} message
 * @param {Object} metadata
 */
async function logAuthAttempt(userId, username, success, message, metadata) {
  try {
    const table = 'audit_logs'; // Default to audit_logs which we know exists
    
    await supabaseAdmin.from(table).insert({
      user_id: userId,
      username: username,
      action: 'login_attempt',
      ip_address: metadata.ip || null,
      user_agent: metadata.userAgent || null,
      status: success ? 'success' : 'failure',
      details: {
        message: message,
        ...metadata
      },
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Log auth attempt error:', error);
  }
}

/**
 * Check if user has specific permission
 * @param {Object} user
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;

  // Super admin and admin have all permissions
  if (['super_admin', 'admin'].includes(user.role)) {
    return true;
  }

  // Role-based permissions
  const rolePermissions = {
    hr_manager: ['workforce', 'employees', 'attendance', 'leave', 'candidates', 'job_openings'],
    finance_manager: ['payroll', 'finance', 'expenses', 'invoices', 'clients'],
    compliance_officer: ['compliance', 'employees'],
    employee: [],
  };

  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes(permission);
}

/**
 * Middleware to require authentication
 * @param {Request} request
 * @returns {Promise<Object|Response>} User payload or error response
 */
export async function requireAuth(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Unauthorized', message: 'No token provided' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return Response.json(
      { error: 'Unauthorized', message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  return payload;
}

/**
 * Middleware to require specific role
 * @param {Object} user
 * @param {string[]} allowedRoles
 * @returns {Response|null}
 */
export function requireRole(user, allowedRoles) {
  if (!user || !allowedRoles.includes(user.role)) {
    return Response.json(
      { error: 'Forbidden', message: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  return null;
}
