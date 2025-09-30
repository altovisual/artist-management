-- Shareable Tracks System
-- Allows users to upload tracks, generate unique shareable links, and track analytics

-- Shareable tracks table
CREATE TABLE IF NOT EXISTS shareable_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  
  -- Track info
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  cover_image_url TEXT,
  audio_file_url TEXT NOT NULL, -- URL to audio file in storage
  duration_ms INTEGER,
  
  -- Shareable link
  share_code TEXT UNIQUE NOT NULL, -- Unique code for the link (e.g., "abc123")
  share_url TEXT, -- Full shareable URL
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE, -- If false, requires password or specific access
  password_hash TEXT, -- Optional password protection
  max_plays INTEGER, -- Optional limit on plays
  expires_at TIMESTAMPTZ, -- Optional expiration date
  
  -- Metadata
  description TEXT,
  genre TEXT,
  release_date DATE,
  
  -- Analytics summary (updated by triggers)
  total_plays INTEGER DEFAULT 0,
  unique_listeners INTEGER DEFAULT 0,
  total_listen_time_ms BIGINT DEFAULT 0,
  avg_completion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track plays/listens table (extends audio_events for shareable tracks)
CREATE TABLE IF NOT EXISTS shareable_track_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Track reference
  shareable_track_id UUID REFERENCES shareable_tracks(id) ON DELETE CASCADE NOT NULL,
  share_code TEXT NOT NULL,
  
  -- Session info
  session_id UUID NOT NULL,
  
  -- Listener info (anonymous or authenticated)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if anonymous
  listener_ip TEXT, -- Hashed IP for privacy
  listener_country TEXT,
  listener_city TEXT,
  
  -- Device info
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  
  -- Referrer info
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Play metrics
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  listen_duration_ms INTEGER DEFAULT 0,
  max_position_reached_ms INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  play_count INTEGER DEFAULT 1,
  pause_count INTEGER DEFAULT 0,
  seek_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shareable_tracks_user_id ON shareable_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_shareable_tracks_share_code ON shareable_tracks(share_code);
CREATE INDEX IF NOT EXISTS idx_shareable_tracks_artist_id ON shareable_tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_shareable_tracks_is_active ON shareable_tracks(is_active);

CREATE INDEX IF NOT EXISTS idx_shareable_track_plays_track_id ON shareable_track_plays(shareable_track_id);
CREATE INDEX IF NOT EXISTS idx_shareable_track_plays_share_code ON shareable_track_plays(share_code);
CREATE INDEX IF NOT EXISTS idx_shareable_track_plays_session_id ON shareable_track_plays(session_id);
CREATE INDEX IF NOT EXISTS idx_shareable_track_plays_started_at ON shareable_track_plays(started_at DESC);

-- RLS Policies
ALTER TABLE shareable_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_track_plays ENABLE ROW LEVEL SECURITY;

-- Shareable tracks policies
CREATE POLICY "Users can view their own shareable tracks"
  ON shareable_tracks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shareable tracks"
  ON shareable_tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shareable tracks"
  ON shareable_tracks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shareable tracks"
  ON shareable_tracks FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view active shareable tracks by share_code
CREATE POLICY "Public can view active shareable tracks"
  ON shareable_tracks FOR SELECT
  USING (is_active = TRUE AND is_public = TRUE);

-- Admins can view all shareable tracks
CREATE POLICY "Admins can view all shareable tracks"
  ON shareable_tracks FOR SELECT
  USING (public.is_admin());

-- Shareable track plays policies
CREATE POLICY "Track owners can view plays"
  ON shareable_track_plays FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shareable_tracks
      WHERE shareable_tracks.id = shareable_track_plays.shareable_track_id
      AND shareable_tracks.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert plays"
  ON shareable_track_plays FOR INSERT
  WITH CHECK (TRUE); -- Allow anonymous plays

CREATE POLICY "Admins can view all plays"
  ON shareable_track_plays FOR SELECT
  USING (public.is_admin());

-- Function to generate unique share code
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM shareable_tracks WHERE share_code = result) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update shareable track analytics
CREATE OR REPLACE FUNCTION update_shareable_track_analytics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shareable_tracks
  SET
    total_plays = (
      SELECT COUNT(DISTINCT session_id)
      FROM shareable_track_plays
      WHERE shareable_track_id = NEW.shareable_track_id
    ),
    unique_listeners = (
      SELECT COUNT(DISTINCT COALESCE(user_id::text, listener_ip))
      FROM shareable_track_plays
      WHERE shareable_track_id = NEW.shareable_track_id
    ),
    total_listen_time_ms = (
      SELECT COALESCE(SUM(listen_duration_ms), 0)
      FROM shareable_track_plays
      WHERE shareable_track_id = NEW.shareable_track_id
    ),
    avg_completion_rate = (
      SELECT COALESCE(AVG(completion_percentage), 0)
      FROM shareable_track_plays
      WHERE shareable_track_id = NEW.shareable_track_id
      AND completion_percentage > 0
    ),
    updated_at = NOW()
  WHERE id = NEW.shareable_track_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update analytics
CREATE TRIGGER trigger_update_shareable_track_analytics
  AFTER INSERT OR UPDATE ON shareable_track_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_shareable_track_analytics();

-- Function to get shareable track by code (public access)
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

-- Function to get analytics for a shareable track
CREATE OR REPLACE FUNCTION get_shareable_track_analytics(
  p_track_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_plays BIGINT,
  unique_listeners BIGINT,
  total_listen_time_ms BIGINT,
  avg_listen_time_ms NUMERIC,
  completion_rate NUMERIC,
  total_completes BIGINT,
  top_countries JSON,
  top_devices JSON,
  top_referrers JSON,
  plays_by_day JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT stp.session_id) as total_plays,
    COUNT(DISTINCT COALESCE(stp.user_id::text, stp.listener_ip)) as unique_listeners,
    COALESCE(SUM(stp.listen_duration_ms), 0) as total_listen_time_ms,
    COALESCE(AVG(stp.listen_duration_ms), 0) as avg_listen_time_ms,
    COALESCE(AVG(stp.completion_percentage), 0) as completion_rate,
    COUNT(*) FILTER (WHERE stp.completed = TRUE) as total_completes,
    
    -- Top countries
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT listener_country as country, COUNT(*) as plays
       FROM shareable_track_plays
       WHERE shareable_track_id = p_track_id
         AND listener_country IS NOT NULL
         AND started_at BETWEEN p_start_date AND p_end_date
       GROUP BY listener_country
       ORDER BY plays DESC
       LIMIT 5
     ) t
    ) as top_countries,
    
    -- Top devices
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT device_type, COUNT(*) as plays
       FROM shareable_track_plays
       WHERE shareable_track_id = p_track_id
         AND device_type IS NOT NULL
         AND started_at BETWEEN p_start_date AND p_end_date
       GROUP BY device_type
       ORDER BY plays DESC
       LIMIT 5
     ) t
    ) as top_devices,
    
    -- Top referrers
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT referrer_url, COUNT(*) as plays
       FROM shareable_track_plays
       WHERE shareable_track_id = p_track_id
         AND referrer_url IS NOT NULL
         AND started_at BETWEEN p_start_date AND p_end_date
       GROUP BY referrer_url
       ORDER BY plays DESC
       LIMIT 5
     ) t
    ) as top_referrers,
    
    -- Plays by day
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT DATE(started_at) as date, COUNT(*) as plays
       FROM shareable_track_plays
       WHERE shareable_track_id = p_track_id
         AND started_at BETWEEN p_start_date AND p_end_date
       GROUP BY DATE(started_at)
       ORDER BY date DESC
     ) t
    ) as plays_by_day
    
  FROM shareable_track_plays stp
  WHERE stp.shareable_track_id = p_track_id
    AND stp.started_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE shareable_tracks IS 'Tracks that can be shared via unique links with analytics';
COMMENT ON TABLE shareable_track_plays IS 'Analytics data for shareable track plays';
COMMENT ON FUNCTION generate_share_code IS 'Generates a unique 8-character share code';
COMMENT ON FUNCTION get_shareable_track_by_code IS 'Public function to retrieve track by share code';
COMMENT ON FUNCTION get_shareable_track_analytics IS 'Get detailed analytics for a shareable track';
