
ALTER TABLE public.artists
ADD COLUMN spotify_artist_id TEXT UNIQUE;

COMMENT ON COLUMN public.artists.spotify_artist_id IS 'The unique Spotify ID for the artist profile.';
