-- Fix for get_shareable_track_by_code function
-- This ensures the function exists and works correctly

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_shareable_track_by_code(TEXT);

-- Recreate the function with correct column references
CREATE OR REPLACE FUNCTION get_shareable_track_by_code(p_share_code TEXT)
RETURNS TABLE (
  id UUID,
  track_name TEXT,
  artist_name TEXT,
  album_name TEXT,
  cover_image_url TEXT,
  audio_file_url TEXT,
  duration_ms INTEGER,
  description TEXT,
  genre TEXT,
  release_date DATE,
  total_plays INTEGER,
  is_active BOOLEAN,
  requires_password BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.id,
    st.track_name,
    st.artist_name,
    st.album_name,
    st.cover_image_url,
    st.audio_file_url,
    st.duration_ms,
    st.description,
    st.genre,
    st.release_date,
    st.total_plays,
    st.is_active,
    (st.password_hash IS NOT NULL) as requires_password
  FROM shareable_tracks st
  WHERE st.share_code = p_share_code
    AND st.is_active = TRUE
    AND st.is_public = TRUE
    AND (st.expires_at IS NULL OR st.expires_at > NOW())
    AND (st.max_plays IS NULL OR st.total_plays < st.max_plays);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_shareable_track_by_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_shareable_track_by_code(TEXT) TO authenticated;

-- Verify the function was created
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'get_shareable_track_by_code';
