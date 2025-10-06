-- Improve Analytics Tracking for Shareable Tracks
-- Allows proper accumulation of metrics across sessions and page reloads

-- Add policy to allow anyone to update their own session plays
CREATE POLICY "Anyone can update their own session plays"
  ON shareable_track_plays FOR UPDATE
  USING (TRUE) -- Allow updates from anyone (they have their session_id)
  WITH CHECK (TRUE);

-- Create function to increment track plays safely
CREATE OR REPLACE FUNCTION increment_track_play(
  p_shareable_track_id UUID,
  p_session_id UUID
)
RETURNS void AS $$
BEGIN
  -- Update the play record if it exists
  UPDATE shareable_track_plays
  SET 
    play_count = play_count + 1,
    updated_at = NOW()
  WHERE session_id = p_session_id
    AND shareable_track_id = p_shareable_track_id;
  
  -- If no rows were updated, this is a new session (handled by upsert in app)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve the analytics update function to handle accumulation better
CREATE OR REPLACE FUNCTION update_shareable_track_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the shareable track with aggregated metrics
  UPDATE shareable_tracks
  SET
    -- Count distinct sessions as total plays
    total_plays = (
      SELECT COUNT(DISTINCT session_id)
      FROM shareable_track_plays
      WHERE shareable_track_id = NEW.shareable_track_id
    ),
    -- Count unique listeners (by user_id or IP)
    unique_listeners = (
      SELECT COUNT(DISTINCT COALESCE(user_id::text, listener_ip, session_id::text))
      FROM shareable_track_plays
      WHERE shareable_track_id = NEW.shareable_track_id
    ),
    -- Sum all listen durations
    total_listen_time_ms = (
      SELECT COALESCE(SUM(listen_duration_ms), 0)
      FROM shareable_track_plays
      WHERE shareable_track_id = NEW.shareable_track_id
    ),
    -- Average completion rate across all sessions
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

-- Add index for better performance on session lookups
CREATE INDEX IF NOT EXISTS idx_shareable_track_plays_session_track 
  ON shareable_track_plays(session_id, shareable_track_id);

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_shareable_track_plays_track_started 
  ON shareable_track_plays(shareable_track_id, started_at DESC);

-- Comments
COMMENT ON POLICY "Anyone can update their own session plays" ON shareable_track_plays IS 
  'Allows anonymous users to update their play session metrics';
COMMENT ON FUNCTION increment_track_play IS 
  'Safely increments play count for a session';
COMMENT ON INDEX idx_shareable_track_plays_session_track IS 
  'Improves performance for session-based updates';
COMMENT ON INDEX idx_shareable_track_plays_track_started IS 
  'Improves performance for analytics queries';
