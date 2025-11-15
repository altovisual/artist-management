-- Add user_type enum and artist_profile_id to user_profiles table

-- Step 1: Create user_type enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('artist', 'manager', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS user_type public.user_type,
ADD COLUMN IF NOT EXISTS artist_profile_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_artist_profile ON public.user_profiles(artist_profile_id);

-- Step 4: Add constraint to ensure artists can only have one profile
-- This will be enforced at the application level and through RLS policies

-- Step 5: Update RLS policies to handle artist profiles
-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Artists can view their own artist profile" ON public.artists;

CREATE POLICY "Artists can view their own artist profile"
  ON public.artists
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_profiles 
      WHERE user_type = 'artist' AND artist_profile_id = artists.id
    )
    OR
    auth.uid() IN (
      SELECT user_id FROM public.user_profiles 
      WHERE user_type = 'manager'
    )
  );

-- Step 6: Add comments
COMMENT ON COLUMN public.user_profiles.user_type IS 'Type of user: artist, manager, or other';
COMMENT ON COLUMN public.user_profiles.artist_profile_id IS 'For artists: links to their single artist profile';
COMMENT ON COLUMN public.user_profiles.username IS 'Display username for the user';
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'Profile avatar URL';
