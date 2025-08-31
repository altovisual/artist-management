-- 026_create_events_table.sql

-- 1. Create the events table
CREATE TABLE public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid NULL REFERENCES public.projects(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    category text,
    all_day boolean DEFAULT false NOT NULL
);

-- Add comments to the columns for clarity
COMMENT ON COLUMN public.events.artist_id IS 'The artist this event belongs to.';
COMMENT ON COLUMN public.events.user_id IS 'The user who owns this event.';
COMMENT ON COLUMN public.events.project_id IS 'Optional link to a specific project/release.';
COMMENT ON COLUMN public.events.title IS 'The title or name of the event.';
COMMENT ON COLUMN public.events.start_time IS 'The start date and time of the event.';
COMMENT ON COLUMN public.events.end_time IS 'The end date and time of the event.';
COMMENT ON COLUMN public.events.category IS 'Event category (e.g., Release, Concert, Marketing, Personal).';
COMMENT ON COLUMN public.events.all_day IS 'Indicates if the event is an all-day event.';

-- 2. Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for CRUD operations
CREATE POLICY "Enable CRUD for owners and admins" ON public.events
FOR ALL
USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = events.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = events.artist_id AND artists.user_id = auth.uid())
);

-- 4. Create indexes for performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_artist_id ON public.events(artist_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_end_time ON public.events(end_time);
