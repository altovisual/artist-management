-- Create function to get all artists for admin users
CREATE OR REPLACE FUNCTION public.get_all_artists_admin()
RETURNS TABLE (
  id UUID,
  name TEXT,
  genre TEXT,
  spotify_artist_id TEXT,
  muso_ai_profile_id TEXT,
  image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Return all artists
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.genre,
    a.spotify_artist_id,
    a.muso_ai_profile_id,
    a.image_url
  FROM public.artists a
  ORDER BY a.name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_artists_admin() TO authenticated;
