/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables are automatically available with NEXT_PUBLIC_ prefix
  // No need to explicitly define them here
  
  // Enable standalone output for better deployment compatibility
  output: 'standalone',
  
  // Ensure environment variables are available at runtime
  env: {
    NEXT_PUBLIC_ADMIN_USER: process.env.NEXT_PUBLIC_ADMIN_USER,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
};

export default nextConfig;
