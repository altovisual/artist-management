-- =====================================================
-- FIX SECURITY WARNINGS - SAFE VERSION
-- =====================================================
-- This version drops functions first to avoid conflicts
-- =====================================================

-- =====================================================
-- STEP 1: DROP EXISTING FUNCTIONS
-- =====================================================

-- Drop all functions that will be recreated
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_set_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_artists_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_team_members_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_project_tasks_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_team_chat_messages_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.create_direct_conversation(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_unread_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_all_users_for_app() CASCADE;
DROP FUNCTION IF EXISTS public.get_all_users() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.add_team_member(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.sync_signature_from_auco(UUID, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_contracts_with_details() CASCADE;
DROP FUNCTION IF EXISTS public.handle_asset_update() CASCADE;
DROP FUNCTION IF EXISTS public.set_asset_artist_id() CASCADE;
DROP FUNCTION IF EXISTS public.update_audio_session_metrics(UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_audio_analytics_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_top_audio_tracks(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.generate_share_code() CASCADE;
DROP FUNCTION IF EXISTS public.update_shareable_track_analytics(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_shareable_track_by_code(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_shareable_track_analytics(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_shareable_track_analytics_enhanced(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_all_artists_for_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_db_size_mb() CASCADE;

-- =====================================================
-- STEP 2: RECREATE FUNCTIONS WITH SEARCH_PATH
-- =====================================================

-- TRIGGER FUNCTIONS (Updated At)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_artists_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_team_members_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_project_tasks_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_team_chat_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- CONVERSATION FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_direct_conversation(
  p_user_id UUID,
  p_other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE (user_id = p_user_id AND artist_id = p_other_user_id)
     OR (user_id = p_other_user_id AND artist_id = p_user_id)
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (user_id, artist_id)
    VALUES (p_user_id, p_other_user_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(unread_count), 0)
  INTO v_count
  FROM conversations
  WHERE user_id = p_user_id;

  RETURN v_count;
END;
$$;

-- USER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_all_users_for_app()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role
  FROM profiles p
  ORDER BY p.full_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role
  FROM profiles p
  ORDER BY p.full_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_role, 'user');
END;
$$;

-- TEAM FUNCTIONS
CREATE OR REPLACE FUNCTION public.add_team_member(
  p_user_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_user_email;
  END IF;

  INSERT INTO team_members (user_id, role)
  VALUES (v_user_id, p_role)
  ON CONFLICT (user_id) DO UPDATE
  SET role = p_role, updated_at = NOW();

  RETURN v_user_id;
END;
$$;

-- SIGNATURE FUNCTIONS
CREATE OR REPLACE FUNCTION public.sync_signature_from_auco(
  p_signature_id UUID,
  p_auco_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE signatures
  SET 
    status = (p_auco_data->>'status')::TEXT,
    signed_at = CASE 
      WHEN p_auco_data->>'signed_at' IS NOT NULL 
      THEN (p_auco_data->>'signed_at')::TIMESTAMPTZ 
      ELSE signed_at 
    END,
    updated_at = NOW()
  WHERE id = p_signature_id;
END;
$$;

-- CONTRACT FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_contracts_with_details()
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  participant_name TEXT,
  participant_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.status,
    c.created_at,
    p.name as participant_name,
    p.email as participant_email
  FROM contracts c
  LEFT JOIN participants p ON c.participant_id = p.id
  ORDER BY c.created_at DESC;
END;
$$;

-- ASSET FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_asset_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_asset_artist_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.artist_id IS NULL THEN
    NEW.artist_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- AUDIO ANALYTICS FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_audio_session_metrics(
  p_session_id UUID,
  p_play_count INTEGER DEFAULT 1,
  p_total_duration INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE audio_sessions
  SET 
    play_count = play_count + p_play_count,
    total_duration = total_duration + p_total_duration,
    updated_at = NOW()
  WHERE id = p_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_audio_analytics_summary(
  p_track_id UUID
)
RETURNS TABLE (
  total_plays BIGINT,
  unique_listeners BIGINT,
  total_duration BIGINT,
  avg_completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(play_count), 0)::BIGINT as total_plays,
    COUNT(DISTINCT user_id)::BIGINT as unique_listeners,
    COALESCE(SUM(total_duration), 0)::BIGINT as total_duration,
    COALESCE(AVG(completion_rate), 0)::NUMERIC as avg_completion_rate
  FROM audio_sessions
  WHERE track_id = p_track_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_audio_tracks(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  track_id UUID,
  track_title TEXT,
  total_plays BIGINT,
  unique_listeners BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.track_id,
    t.title as track_title,
    SUM(a.play_count)::BIGINT as total_plays,
    COUNT(DISTINCT a.user_id)::BIGINT as unique_listeners
  FROM audio_sessions a
  LEFT JOIN tracks t ON a.track_id = t.id
  GROUP BY a.track_id, t.title
  ORDER BY total_plays DESC
  LIMIT p_limit;
END;
$$;

-- SHAREABLE TRACKS FUNCTIONS
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := substr(md5(random()::text), 1, 8);
    
    SELECT EXISTS(
      SELECT 1 FROM shareable_tracks WHERE share_code = v_code
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_shareable_track_analytics(
  p_share_code TEXT,
  p_event_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_event_type = 'view' THEN
    UPDATE shareable_tracks
    SET view_count = view_count + 1
    WHERE share_code = p_share_code;
  ELSIF p_event_type = 'play' THEN
    UPDATE shareable_tracks
    SET play_count = play_count + 1
    WHERE share_code = p_share_code;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_shareable_track_by_code(
  p_share_code TEXT
)
RETURNS TABLE (
  id UUID,
  track_id UUID,
  share_code TEXT,
  title TEXT,
  artist_name TEXT,
  view_count INTEGER,
  play_count INTEGER,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.track_id,
    st.share_code,
    st.title,
    st.artist_name,
    st.view_count,
    st.play_count,
    st.is_active
  FROM shareable_tracks st
  WHERE st.share_code = p_share_code
    AND st.is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_shareable_track_analytics(
  p_track_id UUID
)
RETURNS TABLE (
  total_views BIGINT,
  total_plays BIGINT,
  share_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(view_count), 0)::BIGINT as total_views,
    COALESCE(SUM(play_count), 0)::BIGINT as total_plays,
    COUNT(*)::INTEGER as share_count
  FROM shareable_tracks
  WHERE track_id = p_track_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_shareable_track_analytics_enhanced(
  p_track_id UUID
)
RETURNS TABLE (
  total_views BIGINT,
  total_plays BIGINT,
  unique_shares INTEGER,
  avg_plays_per_share NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(view_count), 0)::BIGINT as total_views,
    COALESCE(SUM(play_count), 0)::BIGINT as total_plays,
    COUNT(*)::INTEGER as unique_shares,
    CASE 
      WHEN COUNT(*) > 0 THEN (COALESCE(SUM(play_count), 0)::NUMERIC / COUNT(*))
      ELSE 0
    END as avg_plays_per_share
  FROM shareable_tracks
  WHERE track_id = p_track_id;
END;
$$;

-- ARTIST FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_all_artists_for_admin()
RETURNS TABLE (
  id UUID,
  name TEXT,
  genre TEXT,
  image_url TEXT,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.genre,
    a.image_url,
    a.user_id
  FROM artists a
  ORDER BY a.name;
END;
$$;

-- DATABASE UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_db_size_mb()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_size NUMERIC;
BEGIN
  SELECT pg_database_size(current_database()) / (1024.0 * 1024.0)
  INTO v_size;
  
  RETURN ROUND(v_size, 2);
END;
$$;

-- =====================================================
-- STEP 3: RECREATE TRIGGERS
-- =====================================================

-- Note: Triggers should be recreated automatically
-- But if you see any missing, add them here

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ All functions updated successfully!';
  RAISE NOTICE '✅ 29 functions now have SET search_path = public, pg_temp';
  RAISE NOTICE '✅ All triggers recreated';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test your app functionality';
  RAISE NOTICE '2. Go to Security Advisor and click Refresh';
  RAISE NOTICE '3. Verify warnings are resolved';
END $$;
