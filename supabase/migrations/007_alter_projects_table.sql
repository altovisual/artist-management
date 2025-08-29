-- Add cover_art_url and notes to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS cover_art_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;