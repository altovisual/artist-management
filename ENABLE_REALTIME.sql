-- ============================================
-- ENABLE REALTIME FOR CHAT - Execute in Supabase SQL Editor
-- ============================================

-- 1. Enable Realtime for team_chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE team_chat_messages;

-- 2. Verify Realtime is enabled
SELECT 
  schemaname,
  tablename,
  pubname
FROM pg_publication_tables
WHERE tablename = 'team_chat_messages';

-- Expected output: Should show 'supabase_realtime' as pubname

-- 3. Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'team_chat_messages';

-- 4. Check if there are any messages
SELECT COUNT(*) as total_messages FROM team_chat_messages;

-- Done! Now realtime should work for instant message delivery.
