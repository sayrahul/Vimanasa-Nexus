/**
 * Login API Route
 * Handles user authentication and token generation
 */

import { authenticateUser, createToken } from '@/lib/auth';

export const runtime = 'edge';

const loginAttempts = new Map();

function getClientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')
    || 'unknown';
}

function isRateLimited(request) {
  const key = getClientKey(request);
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || now > current.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  current.count += 1;
  return current.count > 10;
}

export async function POST(request) {
  try {
    if (isRateLimited(request)) {
      return Response.json(
        { error: 'Rate Limited', message: 'Too many login attempts. Please try again shortly.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return Response.json(
        { error: 'Validation Error', message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(username, password);

    if (!user) {
      return Response.json(
        { error: 'Authentication Failed', message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = await createToken(user);

    // Return user data and token
    return Response.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      token,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Server Error', message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
