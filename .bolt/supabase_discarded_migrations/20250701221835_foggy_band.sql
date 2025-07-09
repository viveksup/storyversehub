/*
  # Enhanced Stories System with Real-time Support

  1. New Tables
    - `stories` - Main stories table with enhanced metadata
    - `story_analytics` - Real-time analytics for stories
    - `story_categories` - Normalized category system
    - `story_tags` - Many-to-many relationship for tags
    - `user_story_interactions` - Track user interactions
    - `story_versions` - Version control for stories

  2. Indexes
    - Performance indexes for common queries
    - Full-text search indexes

  3. Security
    - RLS policies for all tables
    - Proper access controls

  4. Functions
    - Real-time update triggers
    - Analytics calculation functions
*/

-- Create story categories table
CREATE TABLE IF NOT EXISTS story_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#6366f1',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enhanced stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES story_categories(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  is_featured boolean DEFAULT false,
  is_ai_generated boolean DEFAULT false,
  reading_time_minutes integer DEFAULT 0,
  word_count integer DEFAULT 0,
  language text DEFAULT 'en',
  content_rating text DEFAULT 'general' CHECK (content_rating IN ('general', 'teen', 'mature', 'adult')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create story tags table
CREATE TABLE IF NOT EXISTS story_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, tag)
);

-- Create story analytics table
CREATE TABLE IF NOT EXISTS story_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  bookmarks_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  reading_sessions_count integer DEFAULT 0,
  average_reading_time numeric DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  last_viewed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(story_id)
);

-- Create user story interactions table
CREATE TABLE IF NOT EXISTS user_story_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'like', 'bookmark', 'share', 'comment', 'reading_start', 'reading_complete')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id, interaction_type)
);

-- Create story versions table for version control
CREATE TABLE IF NOT EXISTS story_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  change_summary text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, version_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_category_id ON stories(category_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON stories(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_is_featured ON stories(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_stories_full_text ON stories USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

CREATE INDEX IF NOT EXISTS idx_story_tags_story_id ON story_tags(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_tag ON story_tags(tag);

CREATE INDEX IF NOT EXISTS idx_story_analytics_story_id ON story_analytics(story_id);
CREATE INDEX IF NOT EXISTS idx_story_analytics_views ON story_analytics(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_story_analytics_likes ON story_analytics(likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_story_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_story_id ON user_story_interactions(story_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_story_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_story_interactions(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE story_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_categories
CREATE POLICY "Categories are viewable by everyone"
  ON story_categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Only admins can manage categories"
  ON story_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (
        email LIKE '%admin%' OR 
        jsonb_extract_path_text(raw_user_meta_data, 'role') = 'admin'
      )
    )
  );

-- RLS Policies for stories
CREATE POLICY "Published stories are viewable by everyone"
  ON stories FOR SELECT
  TO public
  USING (status = 'published' AND visibility = 'public');

CREATE POLICY "Authors can view their own stories"
  ON stories FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own stories"
  ON stories FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- RLS Policies for story_tags
CREATE POLICY "Story tags are viewable with stories"
  ON story_tags FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE id = story_id 
      AND (status = 'published' AND visibility = 'public')
    )
  );

CREATE POLICY "Authors can manage their story tags"
  ON story_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE id = story_id 
      AND author_id = auth.uid()
    )
  );

-- RLS Policies for story_analytics
CREATE POLICY "Story analytics are viewable with stories"
  ON story_analytics FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE id = story_id 
      AND (status = 'published' AND visibility = 'public')
    )
  );

CREATE POLICY "Authors can view their story analytics"
  ON story_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE id = story_id 
      AND author_id = auth.uid()
    )
  );

-- RLS Policies for user_story_interactions
CREATE POLICY "Users can view their own interactions"
  ON user_story_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interactions"
  ON user_story_interactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for story_versions
CREATE POLICY "Authors can view their story versions"
  ON story_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE id = story_id 
      AND author_id = auth.uid()
    )
  );

CREATE POLICY "Authors can manage their story versions"
  ON story_versions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE id = story_id 
      AND author_id = auth.uid()
    )
  );

-- Functions for real-time updates
CREATE OR REPLACE FUNCTION update_story_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when interactions change
  IF TG_OP = 'INSERT' THEN
    INSERT INTO story_analytics (story_id, views_count, likes_count, bookmarks_count, updated_at)
    VALUES (NEW.story_id, 0, 0, 0, now())
    ON CONFLICT (story_id) DO UPDATE SET
      views_count = CASE WHEN NEW.interaction_type = 'view' THEN story_analytics.views_count + 1 ELSE story_analytics.views_count END,
      likes_count = CASE WHEN NEW.interaction_type = 'like' THEN story_analytics.likes_count + 1 ELSE story_analytics.likes_count END,
      bookmarks_count = CASE WHEN NEW.interaction_type = 'bookmark' THEN story_analytics.bookmarks_count + 1 ELSE story_analytics.bookmarks_count END,
      updated_at = now();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE story_analytics SET
      likes_count = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(0, likes_count - 1) ELSE likes_count END,
      bookmarks_count = CASE WHEN OLD.interaction_type = 'bookmark' THEN GREATEST(0, bookmarks_count - 1) ELSE bookmarks_count END,
      updated_at = now()
    WHERE story_id = OLD.story_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for analytics updates
CREATE TRIGGER update_story_analytics_trigger
  AFTER INSERT OR DELETE ON user_story_interactions
  FOR EACH ROW EXECUTE FUNCTION update_story_analytics();

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text text)
RETURNS integer AS $$
BEGIN
  -- Average reading speed: 200 words per minute
  RETURN CEIL(array_length(string_to_array(content_text, ' '), 1) / 200.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate slug
CREATE OR REPLACE FUNCTION generate_slug(title_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title_text, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate reading time and word count
CREATE OR REPLACE FUNCTION update_story_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count = array_length(string_to_array(NEW.content, ' '), 1);
  NEW.reading_time_minutes = calculate_reading_time(NEW.content);
  
  -- Generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_slug(NEW.title) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Set published_at when status changes to published
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = now();
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_story_metadata_trigger
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_story_metadata();

CREATE TRIGGER insert_story_metadata_trigger
  BEFORE INSERT ON stories
  FOR EACH ROW EXECUTE FUNCTION update_story_metadata();

-- Insert default categories
INSERT INTO story_categories (name, slug, description, icon, color) VALUES
  ('Science Fiction', 'sci-fi', 'Futuristic and speculative fiction', 'Rocket', '#3b82f6'),
  ('Fantasy', 'fantasy', 'Magical and mythical adventures', 'Wand2', '#8b5cf6'),
  ('Mystery', 'mystery', 'Suspenseful and investigative stories', 'Search', '#f59e0b'),
  ('Romance', 'romance', 'Love stories and relationships', 'Heart', '#ec4899'),
  ('Horror', 'horror', 'Scary and supernatural tales', 'Skull', '#ef4444'),
  ('Educational', 'educational', 'Learning and instructional content', 'GraduationCap', '#10b981'),
  ('Historical', 'historical', 'Stories set in the past', 'Landmark', '#6b7280'),
  ('Adventure', 'adventure', 'Action-packed journeys', 'Map', '#f97316'),
  ('Cyberpunk', 'cyberpunk', 'High-tech, low-life futures', 'Cpu', '#06b6d4'),
  ('Cosmic Horror', 'cosmic-horror', 'Existential dread and unknown terrors', 'Eye', '#7c3aed'),
  ('AI Fiction', 'ai-fiction', 'Stories about artificial intelligence', 'Bot', '#14b8a6'),
  ('Thriller', 'thriller', 'Fast-paced suspenseful stories', 'Zap', '#dc2626')
ON CONFLICT (slug) DO NOTHING;