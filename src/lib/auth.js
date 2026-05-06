/**
 * Secure Authentication System
 * Server-side authentication with JWT tokens
 */

import { SignJWT, jwtVerify } from 'jose';

// Use a secure secret key (should be in environment variables)
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'vimanasa-nexus-secret-key-change-in-production'
);

// User database (in production, this should be in a real database)
const USERS = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$rKvqZ8YqXqXqXqXqXqXqXeO', // In production, use bcrypt hashed passwords
    role: 'super_admin',
    name: 'System Administrator',
    email: 'admin@vimanasa.com',
    permissions: ['*'], // All permissions
  },
  {
    id: '2',
    username: 'hr_manager',
    password: '$2a$10$hrManagerHashedPassword',
    role: 'hr_manager',
    name: 'HR Manager',
    email: 'hr@vimanasa.com',
    permissions: ['workforce:*', 'attendance:*', 'leave:*'],
  },
  {
    id: '3',
    username: 'finance',
    password: '$2a$10$financeHashedPassword',
    role: 'finance_manager',
    name: 'Finance Manager',
    email: 'finance@vimanasa.com',
    permissions: ['finance:*', 'payroll:*', 'invoices:*'],
  },
];

/**
 * Authenticate user credentials
 * @param {string} username
 * @param {string} password
 * @returns {Object|null} User object without password or null
 */
export async function authenticateUser(username, password) {
  // In production, compare with bcrypt hashed password
  const user = USERS.find(
    (u) => u.username === username && verifyPassword(password, u.password)
  );

  if (!user) {
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Verify password (placeholder - use bcrypt in production)
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {boolean}
 */
function verifyPassword(plainPassword, hashedPassword) {
  // TEMPORARY: For demo purposes, use plain text comparison
  // In production, use: await bcrypt.compare(plainPassword, hashedPassword)
  
  const passwordMap = {
    'Vimanasa@2026': '$2a$10$rKvqZ8YqXqXqXqXqXqXqXeO',
    'hr123': '$2a$10$hrManagerHashedPassword',
    'finance123': '$2a$10$financeHashedPassword',
  };

  return hashedPassword === passwordMap[plainPassword];
}

/**
 * Create JWT token
 * @param {Object} user
 * @returns {Promise<string>} JWT token
 */
export async function createToken(user) {
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
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
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
 * Get user by ID
 * @param {string} userId
 * @returns {Object|null}
 */
export function getUserById(userId) {
  const user = USERS.find((u) => u.id === userId);
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
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
