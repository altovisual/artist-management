-- Add cover_art_url and notes to projects table
ALTER TABLE public.projects
ADD COLUMN cover_art_url TEXT,
ADD COLUMN notes TEXT;