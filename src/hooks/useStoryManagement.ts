import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface StoryDraft {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  category_id?: string;
  tags: string[];
  content_rating: 'general' | 'teen' | 'mature' | 'adult';
  language: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface StoryMedia {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  media_type: 'image' | 'audio' | 'video' | 'document';
}

export const useStoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDraft = useCallback(async (draftData: Partial<StoryDraft>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate ID if not provided
      const draftId = draftData.id || crypto.randomUUID();

      const draftPayload = {
        id: draftId,
        author_id: user.id,
        title: draftData.title || 'Untitled Story',
        content: draftData.content || '',
        excerpt: draftData.excerpt,
        cover_image_url: draftData.cover_image_url,
        category_id: draftData.category_id,
        tags: draftData.tags || [],
        content_rating: draftData.content_rating || 'general',
        language: draftData.language || 'en',
        metadata: draftData.metadata || {},
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('story_drafts')
        .upsert(draftPayload)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const publishStory = useCallback(async (draftId?: string, storyData?: Partial<StoryDraft>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (draftId) {
        // Publish existing draft
        const { data, error } = await supabase.rpc('publish_draft', {
          draft_uuid: draftId
        });

        if (error) throw error;
        return { data: { id: data, slug: 'published-story' }, error: null };
      } else if (storyData) {
        // Create and publish new story directly
        const { data: slugData } = await supabase.rpc('generate_story_slug', {
          title_text: storyData.title || 'Untitled Story'
        });
        const slug = slugData || 'untitled-story';
        
        const storyPayload = {
          title: storyData.title || 'Untitled Story',
          slug,
          excerpt: storyData.excerpt,
          content: storyData.content || '',
          cover_image_url: storyData.cover_image_url,
          author_id: user.id,
          category_id: storyData.category_id,
          status: 'published',
          visibility: 'public',
          content_rating: storyData.content_rating || 'general',
          language: storyData.language || 'en',
          metadata: storyData.metadata || {},
          published_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('stories')
          .insert(storyPayload)
          .select()
          .single();

        if (error) throw error;

        // Add tags if provided
        if (storyData.tags && storyData.tags.length > 0) {
          const tagInserts = storyData.tags.map(tag => ({
            story_id: data.id,
            tag: tag.trim()
          }));

          await supabase
            .from('story_tags')
            .insert(tagInserts);
        }

        return { data, error: null };
      } else {
        throw new Error('Either draftId or storyData must be provided');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish story';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMedia = useCallback(async (file: File, draftId?: string, storyId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('story-media')
        .getPublicUrl(filePath);

      // Save media record
      const mediaPayload = {
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        media_type: file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('audio/') ? 'audio' :
                   file.type.startsWith('video/') ? 'video' : 'document',
        story_id: storyId,
        draft_id: draftId
      };

      const { data, error } = await supabase
        .from('story_media')
        .insert(mediaPayload)
        .select()
        .single();

      if (error) throw error;

      return { data: { url: publicUrl, media: data }, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload media';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('story_drafts')
        .select('*')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drafts';
      setError(errorMessage);
      return { data: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDraft = useCallback(async (draftId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('story_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete draft';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete story';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStory = useCallback(async (storyId: string, updates: Partial<StoryDraft>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('stories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId)
        .select()
        .single();

      if (error) throw error;

      // Update tags if provided
      if (updates.tags) {
        // Delete existing tags
        await supabase
          .from('story_tags')
          .delete()
          .eq('story_id', storyId);

        // Insert new tags
        if (updates.tags.length > 0) {
          const tagInserts = updates.tags.map(tag => ({
            story_id: storyId,
            tag: tag.trim()
          }));

          await supabase
            .from('story_tags')
            .insert(tagInserts);
        }
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update story';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveDraft,
    publishStory,
    uploadMedia,
    getDrafts,
    deleteDraft,
    deleteStory,
    updateStory
  };
};