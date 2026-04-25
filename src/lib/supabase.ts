import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseClient: SupabaseClient | null = null;
let serviceSupabaseClient: SupabaseClient | null = null;

const isValidUrl = (url: string): boolean => {
  try {
    return url.startsWith('https://') && url.includes('supabase.co');
  } catch {
    return false;
  }
};

if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

if (supabaseUrl && supabaseServiceRoleKey && isValidUrl(supabaseUrl)) {
  serviceSupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

if (!supabaseClient && typeof window === 'undefined') {
  console.warn(
    '⚠️ Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
  );
}

export const supabase = supabaseClient;
export const serviceSupabase = serviceSupabaseClient;
