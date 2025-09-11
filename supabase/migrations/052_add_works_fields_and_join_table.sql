-- 1. Add new columns to the projects table for work details
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS isrc TEXT,
ADD COLUMN IF NOT EXISTS upc TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER; -- Duration in seconds

-- 2. Create a join table for the many-to-many relationship between works (projects) and participants (authors/owners)
CREATE TABLE IF NOT EXISTS public.work_participants (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, participant_id)
);

-- 3. Enable RLS and grant permissions for the new join table
ALTER TABLE public.work_participants ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.work_participants TO authenticated;
GRANT ALL ON TABLE public.work_participants TO service_role;

-- 4. Add a basic RLS policy for the join table
CREATE POLICY "Public work participants are viewable by everyone."
ON public.work_participants FOR SELECT
USING (true);

-- Add a policy that allows users to manage participants for projects they are part of (more secure)
-- This is commented out for now but can be enabled later.
-- CREATE POLICY "Users can manage participants of their own projects."
-- ON public.work_participants FOR ALL
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.work_participants wp
--     JOIN public.participants p ON wp.participant_id = p.id
--     WHERE wp.project_id = work_participants.project_id AND p.user_id = auth.uid()
--   )
-- );
