/**
 * Token Verification API Route
 * Verifies JWT token and returns user data
 */

import { verifyToken, getUserById } from '@/lib/authSecure';

export const runtime = 'edge';

export async function GET(request) {
  try {
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

    // Get fresh user data from database
    const user = await getUserById(payload.id);

    if (!user) {
      return Response.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      user,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json(
      { error: 'Server Error', message: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
