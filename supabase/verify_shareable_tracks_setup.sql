-- Verification script for shareable_tracks system
-- Run this to check if everything is set up correctly

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('shareable_tracks', 'shareable_track_plays')
ORDER BY table_name;

-- 2. Check if columns exist in shareable_tracks
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'shareable_tracks'
ORDER BY ordinal_position;

-- 3. Check if RPC functions exist
SELECT 
  routine_name,
  routine_type,
  security_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_share_code',
    'get_shareable_track_by_code',
    'get_shareable_track_analytics'
  )
ORDER BY routine_name;

-- 4. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('shareable_tracks', 'shareable_track_plays')
ORDER BY tablename, policyname;

-- 5. Test generate_share_code function
SELECT generate_share_code() as test_share_code;

-- 6. Count existing shareable tracks
SELECT 
  COUNT(*) as total_tracks,
  COUNT(*) FILTER (WHERE is_active = TRUE) as active_tracks,
  COUNT(*) FILTER (WHERE is_public = TRUE) as public_tracks
FROM shareable_tracks;
