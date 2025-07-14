/*
  # Enhanced Stories System

  1. New Tables
    - Enhanced `stories` table with proper fields
    - `story_drafts` table for draft management
    - `story_media` table for file attachments
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authors to manage their content
    - Public access for published stories
    
  3. Functions
    - Auto-generate slugs
    - Update story metadata
*/

-- Create story_drafts table for managing drafts separately
CREATE TABLE IF NOT EXISTS story_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Story',
  content text DEFAULT '',
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

-- Create story_media table for file attachments
CREATE TABLE IF NOT EXISTS story_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  draft_id uuid REFERENCES story_drafts(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  media_type text DEFAULT 'image' CHECK (media_type IN ('image', 'audio', 'video', 'document')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT story_media_reference_check CHECK (
    (story_id IS NOT NULL AND draft_id IS NULL) OR 
    (story_id IS NULL AND draft_id IS NOT NULL)
  )
);

-- Add missing columns to stories table if they don't exist
DO $$
BEGIN
  -- Add excerpt column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE stories ADD COLUMN excerpt text;
  END IF;

  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE stories ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;

  -- Add cover_image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE stories ADD COLUMN cover_image_url text;
  END IF;
END $$;

-- Function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_story_slug(title_text text)
RETURNS text AS $$
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
$$ LANGUAGE plpgsql;

-- Function to publish a draft
CREATE OR REPLACE FUNCTION publish_draft(draft_uuid uuid)
RETURNS uuid AS $$
DECLARE
  draft_record story_drafts%ROWTYPE;
  new_story_id uuid;
  generated_slug text;
BEGIN
  -- Get the draft
  SELECT * INTO draft_record FROM story_drafts WHERE id = draft_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found';
  END IF;
  
  -- Generate unique slug
  generated_slug := generate_story_slug(draft_record.title);
  
  -- Create the published story
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
    metadata,
    published_at
  ) VALUES (
    draft_record.title,
    generated_slug,
    draft_record.excerpt,
    draft_record.content,
    draft_record.cover_image_url,
    draft_record.author_id,
    draft_record.category_id,
    'published',
    'public',
    draft_record.content_rating,
    draft_record.language,
    draft_record.metadata,
    now()
  ) RETURNING id INTO new_story_id;
  
  -- Copy tags
  IF array_length(draft_record.tags, 1) > 0 THEN
    INSERT INTO story_tags (story_id, tag)
    SELECT new_story_id, unnest(draft_record.tags);
  END IF;
  
  -- Move media files from draft to story
  UPDATE story_media 
  SET story_id = new_story_id, draft_id = NULL 
  WHERE draft_id = draft_uuid;
  
  -- Delete the draft
  DELETE FROM story_drafts WHERE id = draft_uuid;
  
  RETURN new_story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_drafts
CREATE POLICY "Authors can manage their own drafts"
  ON story_drafts
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- RLS Policies for story_media
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
  )
  WITH CHECK (
    (story_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM stories WHERE id = story_media.story_id AND author_id = auth.uid()
    )) OR
    (draft_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM story_drafts WHERE id = story_media.draft_id AND author_id = auth.uid()
    ))
  );

-- Public access to media for published stories
CREATE POLICY "Public can view published story media"
  ON story_media
  FOR SELECT
  TO public
  USING (
    story_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM stories 
      WHERE id = story_media.story_id 
      AND status = 'published' 
      AND visibility = 'public'
    )
  );

-- Update existing stories policies to allow authors to edit/delete
DROP POLICY IF EXISTS "Authors can manage their own stories" ON stories;
CREATE POLICY "Authors can manage their own stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Create storage bucket for story media if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-media', 'story-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for story media
CREATE POLICY "Authenticated users can upload story media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'story-media');

CREATE POLICY "Users can update their own story media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'story-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own story media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'story-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view story media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'story-media');