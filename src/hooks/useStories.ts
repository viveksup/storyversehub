import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Story {
  id: string;
  title: string;
  description: string;
  content: string;
  cover_image: string;
  author_id: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  content_type: 'story' | 'comic' | 'educational';
  categories: string[];
  pages: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryFilters {
  categories?: string[];
  author?: string;
  content_type?: 'story' | 'comic' | 'educational';
  is_published?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const useStories = (filters: StoryFilters = {}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchStories = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('content')
        .select(`
          *,
          author:users!content_author_id_fkey(id, email)
        `, { count: 'exact' });

      // Apply filters
      if (filters.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      } else {
        // Default to published content for public access
        query = query.eq('is_published', true);
      }

      if (filters.categories && filters.categories.length > 0) {
        query = query.overlaps('categories', filters.categories);
      }

      if (filters.author) {
        query = query.eq('author_id', filters.author);
      }

      if (filters.content_type) {
        query = query.eq('content_type', filters.content_type);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'created_at';
      const sortOrder = filters.sort_order || 'desc';
      
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = filters.limit || 20;
      const offset = reset ? 0 : (filters.offset || 0);
      
      query = query.range(offset, offset + limit - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Transform data to match our interface
      const transformedStories: Story[] = (data || []).map(story => ({
        ...story,
        author: {
          id: story.author?.id || '',
          username: story.author?.email?.split('@')[0] || 'Unknown',
          avatar_url: ''
        }
      }));

      if (reset) {
        setStories(transformedStories);
      } else {
        setStories(prev => [...prev, ...transformedStories]);
      }

      setTotalCount(count || 0);
      setHasMore((offset + limit) < (count || 0));

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stories'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchStories(false);
    }
  }, [loading, hasMore, fetchStories]);

  const refresh = useCallback(() => {
    fetchStories(true);
  }, [fetchStories]);

  useEffect(() => {
    fetchStories(true);
  }, [fetchStories]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content',
          filter: 'is_published=eq.true'
        },
        (payload) => {
          console.log('Content change detected:', payload);
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return {
    stories,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh
  };
};

export const useStory = (id: string) => {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('content')
          .select(`
            *,
            author:users!content_author_id_fkey(id, email)
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          const transformedStory: Story = {
            ...data,
            author: {
              id: data.author?.id || '',
              username: data.author?.email?.split('@')[0] || 'Unknown',
              avatar_url: ''
            }
          };

          setStory(transformedStory);

          // Track view
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Track view in reading history
            await supabase
              .from('reading_history')
              .upsert({
                user_id: user.id,
                content_id: id,
                content_type: 'story',
                progress: 0
              });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch story'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  return { story, loading, error };
};