/**
 * Secure Authentication System
 * Server-side authentication with JWT tokens and database-backed users
 */

import { SignJWT, jwtVerify } from 'jose';
import { supabaseAdmin } from './supabase';
import { verifyPassword as verifyPasswordHash } from './passwordHash';

// Validate JWT_SECRET on module load
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production');
  }
  if (process.env.NODE_ENV === 'test') {
    console.warn('⚠️  WARNING: Using test-only JWT secret. Never use in production!');
  } else {
    throw new Error('JWT_SECRET environment variable is required. Set it in .env.local');
  }
}

const SECRET_KEY = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;

/**
 * Authenticate user credentials against database
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object|null>} User object without password or null
 */
export async function authenticateUser(username, password) {
  if (!username || !password) {
    return null;
  }

  try {
    // Fetch user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, password_hash, full_name, role, is_active, is_locked, must_change_password')
      .eq('username', username)
      .single();

    if (error || !user) {
      // Log failed attempt for non-existent user
      await logAuditEvent({
        username,
        action: 'login_attempt',
        status: 'failure',
        details: { reason: 'user_not_found' },
      });
      return null;
    }

    // Check if account is locked
    if (user.is_locked) {
      await logAuditEvent({
        user_id: user.id,
        username: user.username,
        action: 'login_attempt',
        status: 'failure',
        details: { reason: 'account_locked' },
      });
      return null;
    }

    // Check if account is active
    if (!user.is_active) {
      await logAuditEvent({
        user_id: user.id,
        username: user.username,
        action: 'login_attempt',
        status: 'failure',
        details: { reason: 'account_inactive' },
      });
      return null;
    }

    // Verify password
    const isValidPassword = await verifyPasswordHash(password, user.password_hash);

    if (!isValidPassword) {
      // Record failed login attempt
      await recordFailedLogin(user.id);
      await logAuditEvent({
        user_id: user.id,
        username: user.username,
        action: 'login_attempt',
        status: 'failure',
        details: { reason: 'invalid_password' },
      });
      return null;
    }

    // Successful login - reset failed attempts
    await recordSuccessfulLogin(user.id);
    await logAuditEvent({
      user_id: user.id,
      username: user.username,
      action: 'login_attempt',
      status: 'success',
    });

    // Get user permissions
    const { data: permissions } = await supabaseAdmin
      .from('user_permissions')
      .select('permission')
      .eq('user_id', user.id);

    // Return user without password_hash
    return {
      id: user.id,
      username: user.username,
      name: user.full_name,
      email: user.email,
      role: user.role,
      permissions: permissions?.map(p => p.permission) || [],
      must_change_password: user.must_change_password,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Record failed login attempt
 * @param {string} userId
 */
async function recordFailedLogin(userId) {
  try {
    // Increment failed attempts
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('failed_login_attempts')
      .eq('id', userId)
      .single();

    const failedAttempts = (user?.failed_login_attempts || 0) + 1;

    // Update user record
    await supabaseAdmin
      .from('users')
      .update({
        failed_login_attempts: failedAttempts,
        is_locked: failedAttempts >= 5, // Lock after 5 failed attempts
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error recording failed login:', error);
  }
}

/**
 * Record successful login
 * @param {string} userId
 */
async function recordSuccessfulLogin(userId) {
  try {
    await supabaseAdmin
      .from('users')
      .update({
        failed_login_attempts: 0,
        is_locked: false,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error recording successful login:', error);
  }
}

/**
 * Log audit event
 * @param {Object} event
 */
async function logAuditEvent(event) {
  try {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: event.user_id || null,
        username: event.username || null,
        action: event.action,
        resource: event.resource || null,
        resource_id: event.resource_id || null,
        status: event.status,
        details: event.details || null,
      });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Create JWT token
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
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Promise<Object|null>} Decoded token or null
 */
export async function verifyToken(token) {
  try {
    if (!SECRET_KEY) {
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has permission
 * @param {Object} user
 * @param {string} permission - e.g., 'workforce:read', 'finance:write'
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.permissions) return false;

  // Super admin has all permissions
  if (user.permissions.includes('*')) return true;

  // Check exact permission
  if (user.permissions.includes(permission)) return true;

  // Check wildcard permissions (e.g., 'workforce:*' matches 'workforce:read')
  const [resource, action] = permission.split(':');
  return user.permissions.some((p) => {
    const [r, a] = p.split(':');
    return r === resource && a === '*';
  });
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
      .select('id, username, email, full_name, role, is_active')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return null;
    }

    // Get user permissions
    const { data: permissions } = await supabaseAdmin
      .from('user_permissions')
      .select('permission')
      .eq('user_id', user.id);

    return {
      id: user.id,
      username: user.username,
      name: user.full_name,
      email: user.email,
      role: user.role,
      permissions: permissions?.map(p => p.permission) || [],
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Middleware to protect API routes
 * @param {Request} request
 * @returns {Promise<Object|Response>} User object or error response
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
 * Middleware to check permission
 * @param {Object} user
 * @param {string} permission
 * @returns {Response|null} Error response or null if authorized
 */
export function requirePermission(user, permission) {
  if (!hasPermission(user, permission)) {
    return Response.json(
      { error: 'Forbidden', message: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  return null;
}
