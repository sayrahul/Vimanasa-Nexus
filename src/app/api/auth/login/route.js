/**
 * Login API Route
 * Handles user authentication and token generation
 */

import { authenticateUser, createToken } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request) {
  try {
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

    // Create JWT token
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
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Server Error', message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
