-- Create team_chat_messages table
CREATE TABLE IF NOT EXISTS team_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'file', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_project_id ON team_chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_created_at ON team_chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE team_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view messages from projects they have access to
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_chat_messages' AND policyname = 'Users can view team chat messages'
  ) THEN
    CREATE POLICY "Users can view team chat messages"
      ON team_chat_messages
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Users can insert their own messages
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_chat_messages' AND policyname = 'Users can insert their own messages'
  ) THEN
    CREATE POLICY "Users can insert their own messages"
      ON team_chat_messages
      FOR INSERT
      WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

-- Users can update their own messages
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_chat_messages' AND policyname = 'Users can update their own messages'
  ) THEN
    CREATE POLICY "Users can update their own messages"
      ON team_chat_messages
      FOR UPDATE
      USING (auth.uid() = sender_id);
  END IF;
END $$;

-- Users can delete their own messages
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_chat_messages' AND policyname = 'Users can delete their own messages'
  ) THEN
    CREATE POLICY "Users can delete their own messages"
      ON team_chat_messages
      FOR DELETE
      USING (auth.uid() = sender_id);
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS team_chat_messages_updated_at ON team_chat_messages;
CREATE TRIGGER team_chat_messages_updated_at
  BEFORE UPDATE ON team_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_team_chat_messages_updated_at();
