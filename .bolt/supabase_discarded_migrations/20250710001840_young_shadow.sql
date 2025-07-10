/*
  # Fix RLS policies for public access

  1. Security Updates
    - Allow anonymous users to read published stories
    - Allow anonymous users to read story categories
    - Allow anonymous users to read story analytics for published stories
    - Allow anonymous users to read public profiles
    - Fix story analytics foreign key relationship

  2. Changes
    - Add anon role policies for public data access
    - Update existing policies to be more permissive for public content
*/

-- Allow anonymous users to read published stories
CREATE POLICY "Anonymous users can view published stories"
  ON stories
  FOR SELECT
  TO anon
  USING (status = 'published' AND visibility = 'public');

-- Allow anonymous users to read story categories
CREATE POLICY "Anonymous users can view active categories"
  ON story_categories
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow anonymous users to read story analytics for published stories
CREATE POLICY "Anonymous users can view analytics for published stories"
  ON story_analytics
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_analytics.story_id
      AND stories.status = 'published'
      AND stories.visibility = 'public'
    )
  );

-- Allow anonymous users to read public profiles
CREATE POLICY "Anonymous users can view public profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read story tags for published stories
CREATE POLICY "Anonymous users can view tags for published stories"
  ON story_tags
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_tags.story_id
      AND stories.status = 'published'
      AND stories.visibility = 'public'
    )
  );

-- Allow anonymous users to read user story interactions (for analytics)
CREATE POLICY "Anonymous users can view public interactions"
  ON user_story_interactions
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = user_story_interactions.story_id
      AND stories.status = 'published'
      AND stories.visibility = 'public'
    )
  );

-- Update existing policies to be less restrictive for public content
DROP POLICY IF EXISTS "Content access policy" ON content;
CREATE POLICY "Content access policy"
  ON content
  FOR SELECT
  TO public
  USING (is_published = true OR author_id = auth.uid());

-- Ensure story analytics has proper foreign key relationship
DO $$
BEGIN
  -- Check if the foreign key exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'story_analytics_story_id_fkey'
    AND table_name = 'story_analytics'
  ) THEN
    ALTER TABLE story_analytics
    ADD CONSTRAINT story_analytics_story_id_fkey
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
  END IF;
END $$;