// Diagnostic endpoint to check environment variables
export const runtime = 'edge';

// Access environment variables safely
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

export async function GET(req) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: getEnv('NODE_ENV') || 'unknown',
    runtime: 'edge',
    checks: {
      supabaseUrl: {
        exists: !!getEnv('NEXT_PUBLIC_SUPABASE_URL'),
        value: getEnv('NEXT_PUBLIC_SUPABASE_URL') ? 'SET' : 'NOT SET',
        actual: getEnv('NEXT_PUBLIC_SUPABASE_URL') || null
      },
      supabaseAnonKey: {
        exists: !!getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        value: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ? 'SET (length: ' + getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY').length + ')' : 'NOT SET'
      },
      supabaseServiceRoleKey: {
        exists: !!getEnv('SUPABASE_SERVICE_ROLE_KEY'),
        value: getEnv('SUPABASE_SERVICE_ROLE_KEY') ? 'SET (length: ' + getEnv('SUPABASE_SERVICE_ROLE_KEY').length + ')' : 'NOT SET ⚠️'
      },
      adminUser: {
        exists: !!getEnv('NEXT_PUBLIC_ADMIN_USER'),
        value: getEnv('NEXT_PUBLIC_ADMIN_USER') || 'NOT SET'
      },
      adminPassword: {
        exists: !!getEnv('NEXT_PUBLIC_ADMIN_PASSWORD'),
        value: getEnv('NEXT_PUBLIC_ADMIN_PASSWORD') ? 'SET' : 'NOT SET'
      },
      geminiApiKey: {
        exists: !!getEnv('NEXT_PUBLIC_GEMINI_API_KEY'),
        value: getEnv('NEXT_PUBLIC_GEMINI_API_KEY') ? 'SET' : 'NOT SET'
      }
    },
    status: 'OK',
    message: 'Environment diagnostics complete'
  };

  // Check if critical variables are missing
  const criticalMissing = [];
  if (!getEnv('NEXT_PUBLIC_SUPABASE_URL')) criticalMissing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')) criticalMissing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!getEnv('SUPABASE_SERVICE_ROLE_KEY')) criticalMissing.push('SUPABASE_SERVICE_ROLE_KEY');

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
