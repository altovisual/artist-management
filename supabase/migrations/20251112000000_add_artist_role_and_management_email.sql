-- Add role and management_email columns to artists table
-- Migration: 20251112000000_add_artist_role_and_management_email.sql

-- Add role column for artist's primary role (singer, producer, etc.)
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS role TEXT;

-- Add management_email column for the email associated with the management company
ALTER TABLE public.artists
ADD COLUMN IF NOT EXISTS management_email TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.artists.role IS 'Primary role of the artist (singer, producer, songwriter, etc.)';
COMMENT ON COLUMN public.artists.management_email IS 'Email address associated with the management company';

-- Create index for faster filtering by role
CREATE INDEX IF NOT EXISTS idx_artists_role ON public.artists(role);
