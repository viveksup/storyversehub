/*
  # Complete Messaging System

  1. New Tables
    - `conversations` - Chat conversations between users
    - `messages` - Individual messages with status tracking
    - `message_attachments` - File attachments for messages
    - `user_presence` - Real-time user presence tracking
    - `message_notifications` - Notification preferences and history

  2. Security
    - Enable RLS on all tables
    - Add policies for secure message access
    - Ensure users can only see their own conversations

  3. Real-time Features
    - Presence tracking
    - Message delivery status
    - Typing indicators
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_id uuid,
  last_message_at timestamptz DEFAULT now(),
  participant_1_last_read timestamptz DEFAULT now(),
  participant_2_last_read timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 != participant_2)
);

-- Create messages table with enhanced features
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  edited_at timestamptz,
  deleted_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

-- Create user presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen timestamptz DEFAULT now(),
  typing_in_conversation uuid REFERENCES conversations(id) ON DELETE SET NULL,
  typing_started_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create message notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  notification_type text DEFAULT 'message' CHECK (notification_type IN ('message', 'mention', 'system')),
  is_read boolean DEFAULT false,
  sent_email boolean DEFAULT false,
  sent_push boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_message_notifications_user ON message_notifications(user_id, is_read);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() IN (participant_1, participant_2));

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (participant_1, participant_2));

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (participant_1, participant_2));

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND auth.uid() IN (participant_1, participant_2)
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND auth.uid() IN (participant_1, participant_2)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- RLS Policies for message attachments
CREATE POLICY "Users can view attachments in their conversations"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = message_id 
      AND auth.uid() IN (c.participant_1, c.participant_2)
    )
  );

CREATE POLICY "Users can upload attachments to their messages"
  ON message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = message_id 
      AND m.sender_id = auth.uid()
      AND auth.uid() IN (c.participant_1, c.participant_2)
    )
  );

-- RLS Policies for user presence
CREATE POLICY "Users can view all user presence"
  ON user_presence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON user_presence FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for message notifications
CREATE POLICY "Users can view their own notifications"
  ON message_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON message_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions for real-time updates
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_id = NEW.id,
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for conversation updates
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id uuid;
BEGIN
  -- Get the recipient (the other participant in the conversation)
  SELECT 
    CASE 
      WHEN participant_1 = NEW.sender_id THEN participant_2
      ELSE participant_1
    END INTO recipient_id
  FROM conversations 
  WHERE id = NEW.conversation_id;
  
  -- Create notification for recipient
  INSERT INTO message_notifications (user_id, message_id, notification_type)
  VALUES (recipient_id, NEW.id, 'message');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message notifications
CREATE TRIGGER create_message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION create_message_notification();

-- Function to update message status
CREATE OR REPLACE FUNCTION update_message_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message status to delivered when conversation is accessed
  UPDATE messages 
  SET status = 'delivered', updated_at = now()
  WHERE conversation_id = NEW.id 
  AND sender_id != auth.uid()
  AND status = 'sent';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Update message status to read
  UPDATE messages 
  SET status = 'read', updated_at = now()
  WHERE conversation_id = conversation_uuid 
  AND sender_id != auth.uid()
  AND status IN ('sent', 'delivered');
  
  -- Update conversation read timestamp
  UPDATE conversations 
  SET 
    participant_1_last_read = CASE WHEN participant_1 = auth.uid() THEN now() ELSE participant_1_last_read END,
    participant_2_last_read = CASE WHEN participant_2 = auth.uid() THEN now() ELSE participant_2_last_read END,
    updated_at = now()
  WHERE id = conversation_uuid;
  
  -- Mark notifications as read
  UPDATE message_notifications 
  SET is_read = true
  WHERE user_id = auth.uid() 
  AND message_id IN (
    SELECT id FROM messages WHERE conversation_id = conversation_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
  new_status text DEFAULT 'online',
  typing_conversation uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, typing_in_conversation, typing_started_at, updated_at)
  VALUES (
    auth.uid(), 
    new_status, 
    typing_conversation,
    CASE WHEN typing_conversation IS NOT NULL THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    typing_in_conversation = EXCLUDED.typing_in_conversation,
    typing_started_at = EXCLUDED.typing_started_at,
    last_seen = CASE WHEN EXCLUDED.status = 'offline' THEN now() ELSE user_presence.last_seen END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message attachments
CREATE POLICY "Users can view attachments in their conversations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'message-attachments' AND
    EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON ma.message_id = m.id
      JOIN conversations c ON m.conversation_id = c.id
      WHERE ma.file_url = storage.objects.name
      AND auth.uid() IN (c.participant_1, c.participant_2)
    )
  );

CREATE POLICY "Users can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Users can update their own attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'message-attachments');