import { createClient } from '@supabase/supabase-js';

// Access environment variables safely for both Node.js and Edge Runtime
const getEnv = (key) => {
  // Try process.env first (standard Next.js)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing configuration:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  });
}

// Client for browser (uses anon key with RLS)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Client for server-side operations
// Priority: Service Role Key > Anon Key
const adminKey = supabaseServiceRoleKey || supabaseAnonKey;

export const supabaseAdmin = supabaseUrl && adminKey
  ? createClient(supabaseUrl, adminKey)
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
