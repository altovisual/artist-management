ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS spotify_artist_id TEXT;