import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client with dummy values if environment variables are missing
const createSupabaseClient = () => {
  // Only validate if real values are provided
  const hasValidUrl = supabaseUrl && 
    !supabaseUrl.includes('placeholder') && 
    !supabaseUrl.includes('your_supabase_project_url_here') &&
    supabaseUrl.startsWith('https://');

  const hasValidKey = supabaseAnonKey && 
    !supabaseAnonKey.includes('placeholder') && 
    !supabaseAnonKey.includes('your_supabase_anon_key_here');

  // Use valid values if available, otherwise use safe defaults
  const url = hasValidUrl ? supabaseUrl : 'https://placeholder.supabase.co';
  const key = hasValidKey ? supabaseAnonKey : 'placeholder-key';

  // Only validate URL format if we have what appears to be a real URL
  if (hasValidUrl && hasValidKey) {
    try {
      new URL(supabaseUrl);
    } catch (error) {
      console.error(`Invalid Supabase URL format: ${supabaseUrl}`);
    }
  }

  return createClient(url, key, {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createSupabaseClient();

// ✅ Fixed: removed duplicate return + mismatched braces
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('your_supabase_project_url_here') &&
    !supabaseAnonKey.includes('your_supabase_anon_key_here')
  );
};

// Enhanced client with error handling
const createEnhancedClient = () => {
  return {
    ...supabase,
    auth: {
      ...supabase.auth,
      signInWithPassword: async (credentials: any) => {
        if (!isSupabaseConfigured()) {
          throw new Error(
            'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
          );
        }
        return supabase.auth.signInWithPassword(credentials);
      },
      signUp: async (credentials: any) => {
        if (!isSupabaseConfigured()) {
          throw new Error(
            'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
          );
        }
        return supabase.auth.signUp(credentials);
      },
      getUser: async () => {
        if (!isSupabaseConfigured()) {
          return { data: { user: null }, error: null };
        }
        return supabase.auth.getUser();
      },
      onAuthStateChange: (callback: any) => {
        if (!isSupabaseConfigured()) {
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
        return supabase.auth.onAuthStateChange(callback);
      },
    },
    from: (table: string) => {
      const originalFrom = supabase.from(table);
      return {
        ...originalFrom,
        select: (...args: any[]) =>
          isSupabaseConfigured()
            ? originalFrom.select(...args)
            : Promise.resolve({ data: [], error: null, count: 0 }),
        insert: (...args: any[]) =>
          isSupabaseConfigured()
            ? originalFrom.insert(...args)
            : Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        update: (...args: any[]) =>
          isSupabaseConfigured()
            ? originalFrom.update(...args)
            : Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        delete: (...args: any[]) =>
          isSupabaseConfigured()
            ? originalFrom.delete(...args)
            : Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        upsert: (...args: any[]) =>
          isSupabaseConfigured()
            ? originalFrom.upsert(...args)
            : Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      };
    },
  };
};

export default createEnhancedClient();
