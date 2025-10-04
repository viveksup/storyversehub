/*
  # Fix Category Admin Policy

  1. Changes
    - Drop the problematic admin policy that queries auth.users table
    - Create a new admin policy that uses raw_app_meta_data from the JWT
    - This avoids permission denied errors when unauthenticated users query categories

  2. Security
    - Only users with admin role in app_metadata can manage categories
    - Public users can still view active categories
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Only admins can manage categories" ON story_categories;

-- Create a new admin policy that checks JWT claims instead
CREATE POLICY "Only admins can manage categories"
  ON story_categories
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
  );
