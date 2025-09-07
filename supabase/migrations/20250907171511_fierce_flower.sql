/*
  # Fix uid() function errors in RLS policies

  1. Problem
     - Multiple RLS policies are using uid() instead of auth.uid()
     - This causes "function uid() does not exist" errors

  2. Solution
     - Drop and recreate all affected RLS policies
     - Use auth.uid() instead of uid() in all policies
     - Ensure proper authentication checks

  3. Tables Updated
     - profiles: User profile access policies
     - stories: Story access and management policies
     - user_story_interactions: User interaction policies
     - story_tags: Story tag management policies
     - story_versions: Story version access policies
     - story_analytics: Analytics access policies
     - reading_history: Reading history policies
     - bookmarks: Bookmark management policies
     - user_activities: User activity policies
     - reading_sessions: Reading session policies
     - user_preferences: User preference policies
     - subscriptions: Subscription access policies
     - payments: Payment access policies
     - follows: Follow relationship policies
*/

-- Drop existing policies that use uid()
DROP POLICY IF EXISTS "Consolidated profile view policy" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone and users can view their own " ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Authors can manage their own stories" ON stories;
DROP POLICY IF EXISTS "Authors can view their own stories" ON stories;

DROP POLICY IF EXISTS "Users can manage their own interactions" ON user_story_interactions;
DROP POLICY IF EXISTS "Users can view their own interactions" ON user_story_interactions;

DROP POLICY IF EXISTS "Authors can manage their story tags" ON story_tags;

DROP POLICY IF EXISTS "Authors can manage their story versions" ON story_versions;
DROP POLICY IF EXISTS "Authors can view their story versions" ON story_versions;

DROP POLICY IF EXISTS "Authors can view their story analytics" ON story_analytics;

DROP POLICY IF EXISTS "Reading history management" ON reading_history;

DROP POLICY IF EXISTS "Bookmarks management" ON bookmarks;

DROP POLICY IF EXISTS "Users can manage their own activities" ON user_activities;

DROP POLICY IF EXISTS "Users can manage their own reading sessions" ON reading_sessions;

DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;

DROP POLICY IF EXISTS "Follows management" ON follows;

DROP POLICY IF EXISTS "Messages access policy" ON messages;
DROP POLICY IF EXISTS "Messages delete policy" ON messages;
DROP POLICY IF EXISTS "Messages send policy" ON messages;
DROP POLICY IF EXISTS "Messages update policy" ON messages;

-- Recreate policies with correct auth.uid() function

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Stories policies
CREATE POLICY "Authors can manage their own stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Published stories are viewable by everyone"
  ON stories
  FOR SELECT
  TO public
  USING (status = 'published' AND visibility = 'public');

-- User story interactions policies
CREATE POLICY "Users can manage their own interactions"
  ON user_story_interactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Story tags policies
CREATE POLICY "Authors can manage their story tags"
  ON story_tags
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_tags.story_id
    AND stories.author_id = auth.uid()
  ));

CREATE POLICY "Story tags are viewable with stories"
  ON story_tags
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_tags.story_id
    AND stories.status = 'published'
    AND stories.visibility = 'public'
  ));

-- Story versions policies
CREATE POLICY "Authors can manage their story versions"
  ON story_versions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_versions.story_id
    AND stories.author_id = auth.uid()
  ));

-- Story analytics policies
CREATE POLICY "Authors can view their story analytics"
  ON story_analytics
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_analytics.story_id
    AND stories.author_id = auth.uid()
  ));

CREATE POLICY "Story analytics are viewable with published stories"
  ON story_analytics
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_analytics.story_id
    AND stories.status = 'published'
    AND stories.visibility = 'public'
  ));

-- Reading history policies
CREATE POLICY "Users can manage their own reading history"
  ON reading_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can manage their own bookmarks"
  ON bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User activities policies
CREATE POLICY "Users can manage their own activities"
  ON user_activities
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reading sessions policies
CREATE POLICY "Users can manage their own reading sessions"
  ON reading_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Users can manage their own follows"
  ON follows
  FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Messages policies (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Messages access policy" ON messages;
    DROP POLICY IF EXISTS "Messages delete policy" ON messages;
    DROP POLICY IF EXISTS "Messages send policy" ON messages;
    DROP POLICY IF EXISTS "Messages update policy" ON messages;
    
    -- Create new policies
    EXECUTE 'CREATE POLICY "Users can access their own messages" ON messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id)';
    EXECUTE 'CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id)';
    EXECUTE 'CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE TO authenticated USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id)';
    EXECUTE 'CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE TO authenticated USING (auth.uid() = sender_id)';
  END IF;
END $$;