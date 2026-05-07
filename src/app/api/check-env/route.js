export const runtime = 'edge';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req) {
  const variables = {
    NEXT_PUBLIC_ADMIN_USER: !!process.env.NEXT_PUBLIC_ADMIN_USER,
    NEXT_PUBLIC_ADMIN_PASSWORD: !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  };

  const allConfigured = Object.values(variables).every(v => v === true);

  return Response.json({
    allConfigured,
    variables,
    environment: process.env.NODE_ENV,
    message: allConfigured 
      ? 'All environment variables are configured' 
      : 'Some environment variables are missing'
  }, {
    headers: corsHeaders
  });
}
