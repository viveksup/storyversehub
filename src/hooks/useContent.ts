import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, subscribeToContent, saveContentDraft, publishContent } from '../lib/supabase';

export const useContent = (userId: string | undefined) => {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('author_id', userId)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        setDrafts(data?.filter(item => !item.is_published) || []);
        setPublished(data?.filter(item => item.is_published) || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch content'));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    // Subscribe to real-time updates
    const subscription = subscribeToContent(userId, (payload) => {
      if (payload.new) {
        const newItem = payload.new;
        if (newItem.is_published) {
          setPublished(prev => {
            const filtered = prev.filter(item => item.id !== newItem.id);
            return [newItem, ...filtered];
          });
          setDrafts(prev => prev.filter(item => item.id !== newItem.id));
        } else {
          setDrafts(prev => {
            const filtered = prev.filter(item => item.id !== newItem.id);
            return [newItem, ...filtered];
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const saveDraft = async (content: any) => {
    if (!userId) return { error: new Error('No user ID provided') };
    
    try {
      setLoading(true);
      const contentWithId = {
        ...content,
        id: content.id || uuidv4()
      };
      
      const { data, error } = await saveContentDraft(userId, contentWithId);
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save draft');
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const publish = async (contentId: string) => {
    if (!userId) return { error: new Error('No user ID provided') };
    
    try {
      setLoading(true);
      const { data, error } = await publishContent(contentId, userId);
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to publish content');
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    drafts,
    published,
    loading,
    error,
    saveDraft,
    publish
  };
};