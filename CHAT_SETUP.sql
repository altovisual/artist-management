-- ============================================
-- CHAT SETUP - Execute this in Supabase SQL Editor
-- ============================================

-- 1. Create table if not exists
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

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_project_id ON team_chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_created_at ON team_chat_messages(created_at DESC);

-- 3. Enable RLS
ALTER TABLE team_chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view team chat messages" ON team_chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON team_chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON team_chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON team_chat_messages;

-- 5. Create RLS Policies
-- Allow all authenticated users to view messages
CREATE POLICY "Users can view team chat messages"
  ON team_chat_messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON team_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages"
  ON team_chat_messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON team_chat_messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- 6. Create function for updated_at
CREATE OR REPLACE FUNCTION update_team_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger
DROP TRIGGER IF EXISTS team_chat_messages_updated_at ON team_chat_messages;
CREATE TRIGGER team_chat_messages_updated_at
  BEFORE UPDATE ON team_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_team_chat_messages_updated_at();

-- 8. Test query (optional - check if table exists)
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'team_chat_messages'
ORDER BY ordinal_position;

-- 9. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'team_chat_messages';

-- 10. IMPORTANT: Enable Realtime for instant message delivery
ALTER PUBLICATION supabase_realtime ADD TABLE team_chat_messages;

-- 11. Verify Realtime is enabled
SELECT 
  schemaname,
  tablename,
  pubname
FROM pg_publication_tables
WHERE tablename = 'team_chat_messages';

-- Expected: Should show 'supabase_realtime' as pubname

-- Done! Now test sending a message from the app.
-- Messages should appear instantly without refreshing!
