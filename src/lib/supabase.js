import { createClient } from '@supabase/supabase-js';

// Access environment variables explicitly for Next.js static replacement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Global variables to hold the singleton instances
let supabaseInstance = null;
let supabaseAdminInstance = null;

/**
 * Singleton getter for the standard Supabase client
 */
export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    return supabaseInstance;
  }
  
  return null;
};

export const supabase = typeof window !== 'undefined' ? getSupabase() : null;

/**
 * Singleton getter for the Admin Supabase client
 */
export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  const adminKey = supabaseServiceRoleKey || supabaseAnonKey;
  if (supabaseUrl && adminKey) {
    supabaseAdminInstance = createClient(supabaseUrl, adminKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    return supabaseAdminInstance;
  }
  
  return null;
};

export const supabaseAdmin = getSupabaseAdmin();

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
