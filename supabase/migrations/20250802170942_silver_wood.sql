/*
  # Create story management tables

  1. New Tables
    - `story_drafts` - For saving story drafts before publishing
    - `story_media` - For managing uploaded media files
    - `story_versions` - Already exists, but ensure proper structure
    - `user_preferences` - For user reading preferences
    - `reading_sessions` - For tracking reading analytics
    - `user_activities` - For activity tracking

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Add function to generate story slugs
    - Add function to publish drafts
*/

-- Create story_drafts table
CREATE TABLE IF NOT EXISTS story_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Story',
  content text NOT NULL DEFAULT '',
  excerpt text,
  cover_image_url text,
  category_id uuid REFERENCES story_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  content_rating text DEFAULT 'general' CHECK (content_rating IN ('general', 'teen', 'mature', 'adult')),
  language text DEFAULT 'en',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can manage their own drafts"
  ON story_drafts
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Create story_media table
CREATE TABLE IF NOT EXISTS story_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'audio', 'video', 'document')),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  draft_id uuid REFERENCES story_drafts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE story_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can manage their story media"
  ON story_media
  FOR ALL
  TO authenticated
  USING (
    (story_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM stories WHERE id = story_media.story_id AND author_id = auth.uid()
    )) OR
    (draft_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM story_drafts WHERE id = story_media.draft_id AND author_id = auth.uid()
    ))
  );

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weekly_reading_goal integer DEFAULT 5,
  preferred_genres text[] DEFAULT '{}',
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  weekly_digest boolean DEFAULT true,
  public_profile boolean DEFAULT true,
  show_activity boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create reading_sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration integer, -- in seconds
  words_read integer DEFAULT 0,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  reading_speed integer DEFAULT 0, -- words per minute
  comprehension_score integer CHECK (comprehension_score >= 0 AND comprehension_score <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reading sessions"
  ON reading_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN (
    'story_read', 'story_liked', 'story_bookmarked', 'comment_posted', 
    'user_followed', 'reading_session_start', 'reading_session_end'
  )),
  target_id text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own activities"
  ON user_activities
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_drafts_author_id ON story_drafts(author_id);
CREATE INDEX IF NOT EXISTS idx_story_drafts_updated_at ON story_drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_media_story_id ON story_media(story_id);
CREATE INDEX IF NOT EXISTS idx_story_media_draft_id ON story_media(draft_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_story_id ON reading_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);

-- Function to generate story slug
CREATE OR REPLACE FUNCTION generate_story_slug(title_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
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
$$;

-- Function to publish draft
CREATE OR REPLACE FUNCTION publish_draft(draft_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  draft_record story_drafts%ROWTYPE;
  new_story_id uuid;
  story_slug text;
BEGIN
  -- Get the draft
  SELECT * INTO draft_record FROM story_drafts WHERE id = draft_uuid AND author_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found or access denied';
  END IF;
  
  -- Generate unique slug
  story_slug := generate_story_slug(draft_record.title);
  
  -- Create the story
  INSERT INTO stories (
    title, slug, excerpt, content, cover_image_url, author_id, category_id,
    status, visibility, content_rating, language, published_at
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
    now()
  ) RETURNING id INTO new_story_id;
  
  -- Add tags if any
  IF array_length(draft_record.tags, 1) > 0 THEN
    INSERT INTO story_tags (story_id, tag)
    SELECT new_story_id, unnest(draft_record.tags);
  END IF;
  
  -- Move media from draft to story
  UPDATE story_media 
  SET story_id = new_story_id, draft_id = NULL 
  WHERE draft_id = draft_uuid;
  
  -- Delete the draft
  DELETE FROM story_drafts WHERE id = draft_uuid;
  
  RETURN new_story_id;
END;
$$;

-- Add updated_at trigger for story_drafts
CREATE OR REPLACE FUNCTION update_story_drafts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_story_drafts_updated_at
  BEFORE UPDATE ON story_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_story_drafts_updated_at();

-- Add updated_at trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();