-- Add enhanced analytics function with behavior metrics

CREATE OR REPLACE FUNCTION get_shareable_track_analytics_enhanced(
  p_track_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  -- Basic metrics
  total_plays BIGINT,
  unique_listeners BIGINT,
  total_listen_time_ms BIGINT,
  avg_listen_time_ms NUMERIC,
  completion_rate NUMERIC,
  total_completes BIGINT,
  
  -- Behavior metrics
  total_seeks BIGINT,
  total_pauses BIGINT,
  avg_seeks_per_play NUMERIC,
  avg_pauses_per_play NUMERIC,
  
  -- Time metrics
  first_play_at TIMESTAMPTZ,
  last_play_at TIMESTAMPTZ,
  peak_hour INTEGER,
  peak_day_of_week INTEGER,
  
  -- Technical metrics
  top_browsers JSON,
  top_os JSON,
  
  -- Existing metrics
  top_countries JSON,
  top_devices JSON,
  top_referrers JSON,
  plays_by_day JSON,
  plays_by_hour JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Basic metrics
    COUNT(DISTINCT stp.session_id) as total_plays,
    COUNT(DISTINCT COALESCE(stp.user_id::text, stp.listener_ip)) as unique_listeners,
    COALESCE(SUM(stp.listen_duration_ms), 0) as total_listen_time_ms,
    COALESCE(AVG(stp.listen_duration_ms), 0) as avg_listen_time_ms,
    COALESCE(AVG(stp.completion_percentage), 0) as completion_rate,
    COUNT(*) FILTER (WHERE stp.completed = TRUE) as total_completes,
    
    -- Behavior metrics
    COALESCE(SUM(stp.seek_count), 0) as total_seeks,
    COALESCE(SUM(stp.pause_count), 0) as total_pauses,
    COALESCE(AVG(stp.seek_count), 0) as avg_seeks_per_play,
    COALESCE(AVG(stp.pause_count), 0) as avg_pauses_per_play,
    
    -- Time metrics
    MIN(stp.started_at) as first_play_at,
    MAX(stp.started_at) as last_play_at,
    (
      SELECT EXTRACT(HOUR FROM started_at)::INTEGER
      FROM shareable_track_plays
      WHERE shareable_track_id = p_track_id
        AND started_at BETWEEN p_start_date AND p_end_date
      GROUP BY EXTRACT(HOUR FROM started_at)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as peak_hour,
    (
      SELECT EXTRACT(DOW FROM started_at)::INTEGER
      FROM shareable_track_plays
      WHERE shareable_track_id = p_track_id
        AND started_at BETWEEN p_start_date AND p_end_date
      GROUP BY EXTRACT(DOW FROM started_at)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as peak_day_of_week,
    
    -- Technical metrics - Browsers
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT browser, COUNT(*) as plays
       FROM shareable_track_plays
       WHERE shareable_track_id = p_track_id
         AND browser IS NOT NULL
         AND started_at BETWEEN p_start_date AND p_end_date
       GROUP BY browser
       ORDER BY plays DESC
       LIMIT 5
     ) t
    ) as top_browsers,
    
    -- Technical metrics - OS
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT os, COUNT(*) as plays
       FROM shareable_track_plays
       WHERE shareable_track_id = p_track_id
         AND os IS NOT NULL
         AND started_at BETWEEN p_start_date AND p_end_date
       GROUP BY os
       ORDER BY plays DESC
       LIMIT 5
     ) t
    ) as top_os,
    
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
    ) as plays_by_day,
    
    -- Plays by hour
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT EXTRACT(HOUR FROM started_at)::INTEGER as hour, COUNT(*) as plays
       FROM shareable_track_plays
       WHERE shareable_track_id = p_track_id
         AND started_at BETWEEN p_start_date AND p_end_date
       GROUP BY EXTRACT(HOUR FROM started_at)
       ORDER BY hour
     ) t
    ) as plays_by_hour
    
  FROM shareable_track_plays stp
  WHERE stp.shareable_track_id = p_track_id
    AND stp.started_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_shareable_track_analytics_enhanced IS 'Enhanced analytics with behavior, time, and technical metrics';
