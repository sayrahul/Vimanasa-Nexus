import { verifyToken } from '@/lib/auth';

export const runtime = 'edge';

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
];

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': 'https://nexus.vimanasa.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(body, status = 200) {
  return Response.json(body, { status, headers: responseHeaders });
}

async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const payload = await verifyToken(authHeader.substring(7));
  if (!payload || !['super_admin', 'admin'].includes(payload.role)) {
    return null;
  }

  return payload;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: responseHeaders });
}

export async function GET(request) {
  const user = await requireAdmin(request);

  if (!user) {
    return json({ error: 'Unauthorized', message: 'Admin token required' }, 401);
  }

  const checks = Object.fromEntries(
    REQUIRED_ENV.map((key) => [
      key,
      {
        exists: !!process.env[key],
        value: process.env[key] ? 'SET' : 'NOT SET',
      },
    ])
  );
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  return json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    checks,
    status: missing.length === 0 ? 'OK' : 'MISSING_CONFIG',
    missing,
  });
}
