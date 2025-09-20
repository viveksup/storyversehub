import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_id: string;
  author?: {
    id: string;
    username: string;
    avatar_url: string;
  };
  category_id: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  status: 'draft' | 'published' | 'archived' | 'deleted';
  visibility: 'public' | 'private' | 'unlisted';
  is_featured: boolean;
  is_ai_generated: boolean;
  reading_time_minutes: number;
  word_count: number;
  language: string;
  content_rating: 'general' | 'teen' | 'mature' | 'adult';
  published_at: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  analytics: {
    views_count: number;
    likes_count: number;
    bookmarks_count: number;
    comments_count: number;
    shares_count: number;
    reading_sessions_count: number;
    average_reading_time: number;
    completion_rate: number;
  };
}

export interface StoryFilters {
  category?: string;
  tags?: string[];
  author?: string;
  status?: string;
  is_featured?: boolean;
  content_rating?: string;
  search?: string;
  sort_by?: 'created_at' | 'published_at' | 'views_count' | 'likes_count' | 'title';
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
        .from('stories')
        .select(`
          *,
          author:profiles!stories_author_id_fkey(id, username, avatar_url),
          category:story_categories!stories_category_id_fkey(id, name, slug, icon, color),
          tags:story_tags(tag),
          analytics:story_analytics!story_analytics_story_id_fkey(views_count, likes_count, bookmarks_count, comments_count, shares_count, reading_sessions_count, average_reading_time, completion_rate)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // Default to published stories for public access
        query = query.eq('status', 'published').eq('visibility', 'public');
      }

      if (filters.category) {
        query = query.eq('category.slug', filters.category);
      }

      if (filters.author) {
        query = query.eq('author_id', filters.author);
      }

      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }

      if (filters.content_rating) {
        query = query.eq('content_rating', filters.content_rating);
      }

      if (filters.search) {
        query = query.textSearch('title,excerpt,content', filters.search);
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'published_at';
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
        tags: story.tags?.map((t: any) => t.tag) || [],
        analytics: story.analytics || {
          views_count: 0,
          likes_count: 0,
          bookmarks_count: 0,
          comments_count: 0,
          shares_count: 0,
          reading_sessions_count: 0,
          average_reading_time: 0,
          completion_rate: 0,
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
      .channel('stories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: 'status=eq.published'
        },
        (payload) => {
          console.log('Story change detected:', payload);
          refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_analytics'
        },
        (payload) => {
          console.log('Analytics change detected:', payload);
          // Update analytics in real-time without full refresh
          if (payload.eventType === 'UPDATE' && payload.new) {
            setStories(prev => prev.map(story => 
              story.id === payload.new.story_id 
                ? { ...story, analytics: payload.new }
                : story
            ));
          }
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
          .from('stories')
          .select(`
            *,
            author:profiles!stories_author_id_fkey(id, username, avatar_url),
            category:story_categories!stories_category_id_fkey(id, name, slug, icon, color),
            tags:story_tags(tag),
            analytics:story_analytics(*)
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          const transformedStory: Story = {
            ...data,
            tags: data.tags?.map((t: any) => t.tag) || [],
            analytics: data.analytics || {
              views_count: 0,
              likes_count: 0,
              bookmarks_count: 0,
              comments_count: 0,
              shares_count: 0,
              reading_sessions_count: 0,
              average_reading_time: 0,
              completion_rate: 0,
            }
          };

          setStory(transformedStory);

          // Track view
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('user_story_interactions')
              .upsert({
                user_id: user.id,
                story_id: id,
                interaction_type: 'view'
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