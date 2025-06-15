import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

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
    const fileName = `${uuidv4()}.${fileExt}`;
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
      .from('content')
      .upsert({
        id: content.id || uuidv4(),
        author_id: userId,
        ...content,
        is_published: false,
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