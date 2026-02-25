import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env or .env.local file.');
}

// To prevent the application from crashing on load (Uncaught Error: supabaseUrl is required),
// we only initialize the client if the necessary parameters are present.
// Otherwise, we return a proxy that will throw a descriptive error only when accessed.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get: (_, prop) => {
        return () => {
          throw new Error(`Supabase not configured. VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in environment. Accessing: ${String(prop)}`);
        };
      }
    }) as any;
