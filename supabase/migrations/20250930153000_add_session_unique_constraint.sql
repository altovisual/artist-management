-- Delete all duplicate sessions, keeping only the most recent one with most data
DELETE FROM shareable_track_plays
WHERE id NOT IN (
  SELECT DISTINCT ON (session_id) id
  FROM shareable_track_plays
  ORDER BY session_id, 
           seek_count DESC NULLS LAST, 
           pause_count DESC NULLS LAST, 
           listen_duration_ms DESC NULLS LAST,
           created_at DESC
);

-- Now add unique constraint
ALTER TABLE shareable_track_plays 
ADD CONSTRAINT shareable_track_plays_session_id_key UNIQUE (session_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_shareable_track_plays_session_id 
ON shareable_track_plays(session_id);
