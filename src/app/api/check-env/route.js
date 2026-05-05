// Diagnostic API to check environment variables
// This helps debug login issues on production

export async function GET(req) {
  return Response.json({
    hasAdminUser: !!process.env.NEXT_PUBLIC_ADMIN_USER,
    hasAdminPassword: !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    adminUserValue: process.env.NEXT_PUBLIC_ADMIN_USER ? 'SET' : 'NOT SET',
    adminPasswordValue: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? 'SET' : 'NOT SET',
    // Don't expose actual values for security
    environment: process.env.NODE_ENV,
    message: 'Check if environment variables are properly configured'
  });
}
