import { createClient } from '@supabase/supabase-js';

// Access environment variables explicitly for Next.js static replacement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
