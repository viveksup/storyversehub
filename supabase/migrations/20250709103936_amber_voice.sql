/*
  # Fix Database Schema Issues

  1. New Tables
    - `user_activities` - Track user interactions and activities
    - `user_presence` - Track user online status and typing indicators
    - `conversations` - Direct messaging conversations
    - `message_notifications` - Notification system for messages
    - `reading_sessions` - Track reading sessions and progress
    - `user_preferences` - User settings and preferences

  2. Missing Columns
    - Add `last_active_at` to profiles table
    - Add `conversation_id` to messages table

  3. Functions
    - `update_user_presence()` - Update user online status
    - `mark_messages_as_read()` - Mark messages as read

  4. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
    - Fix profiles table policies for public access
*/

-- Add missing column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_active_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  target_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own activities" ON user_activities;
CREATE POLICY "Users can view their own activities"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activities" ON user_activities;
CREATE POLICY "Users can insert their own activities"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen timestamptz DEFAULT now(),
  typing_in_conversation uuid,
  typing_started_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User presence is viewable by everyone" ON user_presence;
CREATE POLICY "User presence is viewable by everyone"
  ON user_presence
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own presence" ON user_presence;
CREATE POLICY "Users can update their own presence"
  ON user_presence
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_id uuid,
  last_message_at timestamptz DEFAULT now(),
  participant_1_last_read timestamptz DEFAULT now(),
  participant_2_last_read timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'conversations_participant_1_participant_2_key'
  ) THEN
    ALTER TABLE conversations ADD CONSTRAINT conversations_participant_1_participant_2_key UNIQUE(participant_1, participant_2);
  END IF;
END $$;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Update messages table to reference conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create message_notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  notification_type text DEFAULT 'message' CHECK (notification_type IN ('message', 'mention', 'system')),
  is_read boolean DEFAULT false,
  sent_email boolean DEFAULT false,
  sent_push boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON message_notifications;
CREATE POLICY "Users can view their own notifications"
  ON message_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON message_notifications;
CREATE POLICY "Users can update their own notifications"
  ON message_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create reading_sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer DEFAULT 0,
  words_read integer DEFAULT 0,
  progress_percentage integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reading sessions" ON reading_sessions;
CREATE POLICY "Users can view their own reading sessions"
  ON reading_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own reading sessions" ON reading_sessions;
CREATE POLICY "Users can manage their own reading sessions"
  ON reading_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  weekly_reading_goal integer DEFAULT 5,
  reading_speed integer DEFAULT 200,
  preferred_voice text DEFAULT 'default',
  auto_play boolean DEFAULT false,
  dark_mode boolean DEFAULT false,
  font_size text DEFAULT 'medium',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create update_user_presence function
CREATE OR REPLACE FUNCTION public.update_user_presence(
  new_status text,
  typing_conversation uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_presence (
    user_id,
    status,
    typing_in_conversation,
    typing_started_at,
    updated_at
  ) VALUES (
    auth.uid(),
    new_status,
    typing_conversation,
    CASE WHEN typing_conversation IS NOT NULL THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = new_status,
    typing_in_conversation = typing_conversation,
    typing_started_at = CASE WHEN typing_conversation IS NOT NULL THEN now() ELSE NULL END,
    updated_at = now();
END;
$$;

-- Create mark_messages_as_read function
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  conversation_uuid uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversations
  SET 
    participant_1_last_read = CASE WHEN participant_1 = auth.uid() THEN now() ELSE participant_1_last_read END,
    participant_2_last_read = CASE WHEN participant_2 = auth.uid() THEN now() ELSE participant_2_last_read END,
    updated_at = now()
  WHERE id = conversation_uuid
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid());

  UPDATE messages
  SET status = 'read'
  WHERE conversation_id = conversation_uuid
    AND sender_id != auth.uid()
    AND status != 'read';
END;
$$;

-- Add foreign key constraint to conversations table for last_message_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'conversations_last_message_id_fkey'
  ) THEN
    ALTER TABLE conversations
    ADD CONSTRAINT conversations_last_message_id_fkey
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_is_read ON message_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_story_id ON reading_sessions(story_id);

-- Update profiles RLS policies to allow public access for author information
DROP POLICY IF EXISTS "Profiles are viewable by everyone and users can view their own " ON profiles;
DROP POLICY IF EXISTS "Consolidated profile view policy" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO public
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

-- Add trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_presence_updated_at ON user_presence;
CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();