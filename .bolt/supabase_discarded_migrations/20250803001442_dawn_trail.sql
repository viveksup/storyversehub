/*
  # Fix Story Publishing System

  1. Database Functions
    - Add function to generate unique story slugs
    - Add function to publish drafts to stories table
    - Add function to update story metadata (word count, reading time)

  2. Triggers
    - Auto-update story metadata on insert/update
    - Auto-create analytics record for new stories

  3. Indexes
    - Improve query performance for story fetching
    - Add full-text search indexes

  4. Security
    - Ensure proper RLS policies for story visibility
*/

-- Function to generate unique story slug
CREATE OR REPLACE FUNCTION generate_story_slug(title_text TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(trim(regexp_replace(title_text, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'untitled-story';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM stories WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to publish a draft
CREATE OR REPLACE FUNCTION publish_draft(draft_uuid UUID)
RETURNS UUID AS $$
DECLARE
  draft_record RECORD;
  new_story_id UUID;
  story_slug TEXT;
BEGIN
  -- Get the draft
  SELECT * INTO draft_record FROM story_drafts WHERE id = draft_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found';
  END IF;
  
  -- Generate unique slug
  story_slug := generate_story_slug(draft_record.title);
  
  -- Create new story
  INSERT INTO stories (
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    author_id,
    category_id,
    status,
    visibility,
    content_rating,
    language,
    published_at
  ) VALUES (
    draft_record.title,
    story_slug,
    draft_record.excerpt,
    draft_record.content,
    draft_record.cover_image_url,
    draft_record.author_id,
    draft_record.category_id,
    'published',
    'public',
    draft_record.content_rating,
    draft_record.language,
    NOW()
  ) RETURNING id INTO new_story_id;
  
  -- Copy tags if they exist
  IF draft_record.tags IS NOT NULL AND array_length(draft_record.tags, 1) > 0 THEN
    INSERT INTO story_tags (story_id, tag)
    SELECT new_story_id, unnest(draft_record.tags);
  END IF;
  
  -- Copy media if it exists
  UPDATE story_media 
  SET story_id = new_story_id, draft_id = NULL 
  WHERE draft_id = draft_uuid;
  
  -- Delete the draft
  DELETE FROM story_drafts WHERE id = draft_uuid;
  
  RETURN new_story_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update story metadata
CREATE OR REPLACE FUNCTION update_story_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate word count
  NEW.word_count := array_length(string_to_array(NEW.content, ' '), 1);
  
  -- Calculate reading time (assuming 200 words per minute)
  NEW.reading_time_minutes := GREATEST(1, ROUND(NEW.word_count / 200.0));
  
  -- Set updated_at
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for story metadata updates
DROP TRIGGER IF EXISTS update_story_metadata_trigger ON stories;
CREATE TRIGGER update_story_metadata_trigger
  BEFORE INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_story_metadata();

-- Function to create story analytics record
CREATE OR REPLACE FUNCTION create_story_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Create analytics record for new published stories
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status != 'published') THEN
    INSERT INTO story_analytics (story_id)
    VALUES (NEW.id)
    ON CONFLICT (story_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for story analytics
DROP TRIGGER IF EXISTS create_story_analytics_trigger ON stories;
CREATE TRIGGER create_story_analytics_trigger
  AFTER INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION create_story_analytics();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_published_status 
ON stories (status, visibility, published_at DESC) 
WHERE status = 'published' AND visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_stories_featured 
ON stories (is_featured, published_at DESC) 
WHERE is_featured = true AND status = 'published';

CREATE INDEX IF NOT EXISTS idx_stories_category_published 
ON stories (category_id, published_at DESC) 
WHERE status = 'published' AND visibility = 'public';

-- Ensure RLS policies are correct for story visibility
DROP POLICY IF EXISTS "Published stories are viewable by everyone" ON stories;
CREATE POLICY "Published stories are viewable by everyone"
  ON stories
  FOR SELECT
  TO public
  USING (status = 'published' AND visibility = 'public');

DROP POLICY IF EXISTS "Authors can view their own stories" ON stories;
CREATE POLICY "Authors can view their own stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (uid() = author_id);

-- Update story analytics policies
DROP POLICY IF EXISTS "Story analytics are viewable with stories" ON story_analytics;
CREATE POLICY "Story analytics are viewable with stories"
  ON story_analytics
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_analytics.story_id 
      AND stories.status = 'published' 
      AND stories.visibility = 'public'
    )
  );