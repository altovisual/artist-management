-- Add user_id column to artists table
ALTER TABLE public.artists
ADD COLUMN user_id UUID;

-- Add foreign key constraint to auth.users table
ALTER TABLE public.artists
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE SET NULL;

-- Create an index on user_id for faster lookups
CREATE INDEX idx_artists_user_id ON public.artists (user_id);