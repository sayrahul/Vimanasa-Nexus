// Diagnostic endpoint to check environment variables
export const runtime = 'edge';

export async function GET(req) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    runtime: 'edge',
    checks: {
      supabaseUrl: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        actual: process.env.NEXT_PUBLIC_SUPABASE_URL || null
      },
      supabaseAnonKey: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'NOT SET'
      },
      supabaseServiceRoleKey: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'NOT SET ⚠️'
      },
      adminUser: {
        exists: !!process.env.NEXT_PUBLIC_ADMIN_USER,
        value: process.env.NEXT_PUBLIC_ADMIN_USER || 'NOT SET'
      },
      adminPassword: {
        exists: !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
        value: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? 'SET' : 'NOT SET'
      },
      geminiApiKey: {
        exists: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        value: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'SET' : 'NOT SET'
      }
    },
    status: 'OK',
    message: 'Environment diagnostics complete'
  };

  // Check if critical variables are missing
  const criticalMissing = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) criticalMissing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) criticalMissing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) criticalMissing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (criticalMissing.length > 0) {
    diagnostics.status = 'ERROR';
    diagnostics.message = `Missing critical environment variables: ${criticalMissing.join(', ')}`;
    diagnostics.criticalMissing = criticalMissing;
  }

  return Response.json(diagnostics, {
    status: criticalMissing.length > 0 ? 500 : 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
