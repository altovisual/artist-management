-- Audio Analytics Tables
-- Tracks all audio player interactions for detailed analytics

-- Main audio events table
CREATE TABLE IF NOT EXISTS audio_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Session Info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- Groups events from same listening session
  
  -- Track Info
  track_id TEXT NOT NULL, -- Spotify/Muso.AI track ID
  track_name TEXT NOT NULL,
  artist_name TEXT,
  album_name TEXT,
  track_duration_ms INTEGER, -- Total duration of track
  
  -- Event Info
  event_type TEXT NOT NULL CHECK (event_type IN ('play', 'pause', 'complete', 'seek', 'progress', 'error')),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Playback Position
  current_position_ms INTEGER, -- Position when event occurred
  previous_position_ms INTEGER, -- For seek events
  
  -- Session Metrics
  listen_duration_ms INTEGER, -- How long they listened in this session
  completion_percentage DECIMAL(5,2), -- % of track completed
  
  -- Context
  source TEXT, -- 'spotify', 'muso_ai', 'creative_vault', etc.
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audio sessions table (aggregated data)
CREATE TABLE IF NOT EXISTS audio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL,
  
  -- User Info
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Track Info
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT,
  
  -- Session Metrics
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  total_listen_time_ms INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  pause_count INTEGER DEFAULT 0,
  seek_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  max_position_reached_ms INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Context
  source TEXT,
  device_type TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_events_user_id ON audio_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_events_session_id ON audio_events(session_id);
CREATE INDEX IF NOT EXISTS idx_audio_events_track_id ON audio_events(track_id);
CREATE INDEX IF NOT EXISTS idx_audio_events_event_type ON audio_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audio_events_timestamp ON audio_events(event_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audio_sessions_user_id ON audio_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_track_id ON audio_sessions(track_id);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_started_at ON audio_sessions(started_at DESC);

-- RLS Policies
ALTER TABLE audio_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view own audio events"
  ON audio_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert own audio events"
  ON audio_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own sessions
CREATE POLICY "Users can view own audio sessions"
  ON audio_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert/update their own sessions
CREATE POLICY "Users can insert own audio sessions"
  ON audio_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audio sessions"
  ON audio_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all events and sessions
CREATE POLICY "Admins can view all audio events"
  ON audio_events FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all audio sessions"
  ON audio_sessions FOR SELECT
  USING (public.is_admin());

-- Function to update session metrics
CREATE OR REPLACE FUNCTION update_audio_session_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert session metrics
  INSERT INTO audio_sessions (
    session_id,
    user_id,
    track_id,
    track_name,
    artist_name,
    started_at,
    source,
    device_type
  ) VALUES (
    NEW.session_id,
    NEW.user_id,
    NEW.track_id,
    NEW.track_name,
    NEW.artist_name,
    NEW.event_timestamp,
    NEW.source,
    NEW.device_type
  )
  ON CONFLICT (session_id) DO UPDATE SET
    ended_at = NEW.event_timestamp,
    total_listen_time_ms = COALESCE(audio_sessions.total_listen_time_ms, 0) + COALESCE(NEW.listen_duration_ms, 0),
    play_count = CASE WHEN NEW.event_type = 'play' THEN audio_sessions.play_count + 1 ELSE audio_sessions.play_count END,
    pause_count = CASE WHEN NEW.event_type = 'pause' THEN audio_sessions.pause_count + 1 ELSE audio_sessions.pause_count END,
    seek_count = CASE WHEN NEW.event_type = 'seek' THEN audio_sessions.seek_count + 1 ELSE audio_sessions.seek_count END,
    completed = CASE WHEN NEW.event_type = 'complete' THEN TRUE ELSE audio_sessions.completed END,
    max_position_reached_ms = GREATEST(COALESCE(audio_sessions.max_position_reached_ms, 0), COALESCE(NEW.current_position_ms, 0)),
    completion_percentage = CASE 
      WHEN NEW.track_duration_ms > 0 THEN 
        (GREATEST(COALESCE(audio_sessions.max_position_reached_ms, 0), COALESCE(NEW.current_position_ms, 0))::DECIMAL / NEW.track_duration_ms::DECIMAL) * 100
      ELSE 0
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update session metrics
CREATE TRIGGER trigger_update_audio_session_metrics
  AFTER INSERT ON audio_events
  FOR EACH ROW
  EXECUTE FUNCTION update_audio_session_metrics();

-- Function to get audio analytics summary
CREATE OR REPLACE FUNCTION get_audio_analytics_summary(
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_plays BIGINT,
  total_listens BIGINT,
  total_listen_time_ms BIGINT,
  avg_listen_time_ms NUMERIC,
  completion_rate NUMERIC,
  unique_tracks BIGINT,
  total_seeks BIGINT,
  total_pauses BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'play') as total_plays,
    COUNT(DISTINCT session_id) as total_listens,
    SUM(listen_duration_ms) as total_listen_time_ms,
    AVG(listen_duration_ms) as avg_listen_time_ms,
    (COUNT(*) FILTER (WHERE event_type = 'complete')::NUMERIC / NULLIF(COUNT(DISTINCT session_id), 0) * 100) as completion_rate,
    COUNT(DISTINCT track_id) as unique_tracks,
    COUNT(*) FILTER (WHERE event_type = 'seek') as total_seeks,
    COUNT(*) FILTER (WHERE event_type = 'pause') as total_pauses
  FROM audio_events
  WHERE 
    (p_user_id IS NULL OR user_id = p_user_id)
    AND event_timestamp BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get top tracks
CREATE OR REPLACE FUNCTION get_top_audio_tracks(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days'
)
RETURNS TABLE (
  track_id TEXT,
  track_name TEXT,
  artist_name TEXT,
  play_count BIGINT,
  total_listen_time_ms BIGINT,
  avg_completion_percentage NUMERIC,
  unique_listeners BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.track_id,
    s.track_name,
    s.artist_name,
    COUNT(s.id) as play_count,
    SUM(s.total_listen_time_ms) as total_listen_time_ms,
    AVG(s.completion_percentage) as avg_completion_percentage,
    COUNT(DISTINCT s.user_id) as unique_listeners
  FROM audio_sessions s
  WHERE 
    (p_user_id IS NULL OR s.user_id = p_user_id)
    AND s.started_at >= p_start_date
  GROUP BY s.track_id, s.track_name, s.artist_name
  ORDER BY play_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE audio_events IS 'Stores individual audio player events for detailed analytics';
COMMENT ON TABLE audio_sessions IS 'Aggregated audio listening sessions with metrics';
COMMENT ON FUNCTION get_audio_analytics_summary IS 'Returns summary analytics for audio playback';
COMMENT ON FUNCTION get_top_audio_tracks IS 'Returns top played tracks with metrics';
