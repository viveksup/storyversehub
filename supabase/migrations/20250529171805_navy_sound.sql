-- Optimize RLS policies for content table
DROP POLICY IF EXISTS "Authors can create their own content" ON content;
DROP POLICY IF EXISTS "Authors can delete their own content" ON content;
DROP POLICY IF EXISTS "Authors can update their own content" ON content;
DROP POLICY IF EXISTS "Authors can view their own content" ON content;
DROP POLICY IF EXISTS "Published content is visible to everyone" ON content;

-- Create consolidated policies
CREATE POLICY "Content access policy"
  ON content
  FOR SELECT
  TO public
  USING (
    is_published = true OR 
    author_id = (SELECT auth.uid())
  );

CREATE POLICY "Content modification policy"
  ON content
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = author_id)
  WITH CHECK ((SELECT auth.uid()) = author_id);

-- Optimize RLS policies for bookmarks table
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;

CREATE POLICY "Bookmarks management"
  ON bookmarks
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Optimize RLS policies for reading_history table
DROP POLICY IF EXISTS "Users can insert into their own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can update their own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can view their own reading history" ON reading_history;

CREATE POLICY "Reading history management"
  ON reading_history
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Optimize RLS policies for follows table
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can see their own follow relationships" ON follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON follows;

CREATE POLICY "Follows management"
  ON follows
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = follower_id)
  WITH CHECK ((SELECT auth.uid()) = follower_id);

-- Optimize RLS policies for messages table
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;

CREATE POLICY "Messages access policy"
  ON messages
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IN (sender_id, recipient_id));

CREATE POLICY "Messages send policy"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = sender_id);

CREATE POLICY "Messages update policy"
  ON messages
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = sender_id)
  WITH CHECK ((SELECT auth.uid()) = sender_id);

CREATE POLICY "Messages delete policy"
  ON messages
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = sender_id);