-- Step 1: Drop the existing foreign key constraint that links projects to artists.
-- We need to do this because we want to link to participants instead.
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_artist_id_fkey;

-- Step 2: Add a new foreign key constraint that links projects.artist_id to our new participants table.
-- This aligns the schema with our new architecture where participants are the central entity.
ALTER TABLE public.projects
ADD CONSTRAINT projects_artist_id_fkey
FOREIGN KEY (artist_id)
REFERENCES public.participants(id)
ON DELETE CASCADE;
