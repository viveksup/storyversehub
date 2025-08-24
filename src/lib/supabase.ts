import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client with dummy values if environment variables are missing
// This prevents the app from crashing during development
const createSupabaseClient = () => {
  // Use fallback values if environment variables are not set
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder-key';
  
  // Skip validation for placeholder values
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your_supabase_project_url_here')) {
    try {
      new URL(supabaseUrl);
    } catch (error) {
      console.error(`Invalid Supabase URL format: ${supabaseUrl}`);
    }
  }
  
  return createClient(url, key, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

export const supabase = createSupabaseClient();

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('your_supabase_project_url_here') &&
    !supabaseAnonKey.includes('your_supabase_anon_key_here'));
};

// Enhanced client with error handling
const createEnhancedClient = () => {
  return {
    ...supabase,
    auth: {
      ...supabase.auth,
      signInWithPassword: async (credentials: any) => {
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        }
        return supabase.auth.signInWithPassword(credentials);
      },
      signUp: async (credentials: any) => {
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
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
          // Return a dummy subscription that does nothing
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
        return supabase.auth.onAuthStateChange(callback);
      }
    },
    from: (table: string) => {
      const originalFrom = supabase.from(table);
      return {
        ...originalFrom,
        select: (...args: any[]) => {
          if (!isSupabaseConfigured()) {
            return Promise.resolve({ data: [], error: null, count: 0 });
          }
          return originalFrom.select(...args);
        },
        insert: (...args: any[]) => {
          if (!isSupabaseConfigured()) {
            return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
          }
          return originalFrom.insert(...args);
        },
        update: (...args: any[]) => {
          if (!isSupabaseConfigured()) {
            return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
          }
          return originalFrom.update(...args);
        },
        delete: (...args: any[]) => {
          if (!isSupabaseConfigured()) {
            return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
          }
          return originalFrom.delete(...args);
        },
        upsert: (...args: any[]) => {
          if (!isSupabaseConfigured()) {
            return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
          }
          return originalFrom.upsert(...args);
        }
      };
    }
  };
};

// Export the enhanced client as the default export
export default createEnhancedClient();

// Profile management functions
export const updateProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

// File upload helpers
export const uploadFile = async (bucket: string, userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, error };
  }
};

// Real-time subscription helpers
export const subscribeToProfile = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToContent = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`content:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'content',
        filter: `author_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// Content management functions
export const saveContentDraft = async (userId: string, content: any) => {
  try {
    const { data, error } = await supabase
      .from('story_drafts')
      .upsert({
        id: content.id || crypto.randomUUID(),
        author_id: userId,
        ...content,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving draft:', error);
    return { data: null, error };
  }
};

export const publishContent = async (contentId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('content')
      .update({
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .match({ id: contentId, author_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error publishing content:', error);
    return { data: null, error };
  }
};