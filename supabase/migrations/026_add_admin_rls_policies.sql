-- Create a helper function to check for admin role in app_metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'
$$;

-- Drop existing policies before creating new ones
-- Note: Dropping by name is specific. If names differ, this might need adjustment.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.artists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.artists;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.artists;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.artists;

DROP POLICY IF EXISTS "Enable CRUD for related records" ON public.social_accounts;
DROP POLICY IF EXISTS "Enable CRUD for related records" ON public.distribution_accounts;
DROP POLICY IF EXISTS "Enable CRUD for related records" ON public.assets;
DROP POLICY IF EXISTS "Enable CRUD for related records" ON public.projects;


-- RLS Policies for 'artists' table
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for owners and admins" ON public.artists
FOR ALL
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- RLS Policies for 'social_accounts' table
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for owners and admins" ON public.social_accounts
FOR ALL
USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = social_accounts.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = social_accounts.artist_id AND artists.user_id = auth.uid())
);

-- RLS Policies for 'distribution_accounts' table
ALTER TABLE public.distribution_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for owners and admins" ON public.distribution_accounts
FOR ALL
USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = distribution_accounts.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = distribution_accounts.artist_id AND artists.user_id = auth.uid())
);

-- RLS Policies for 'projects' table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for owners and admins" ON public.projects
FOR ALL
USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = projects.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = projects.artist_id AND artists.user_id = auth.uid())
);

-- RLS Policies for 'assets' table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable CRUD for owners and admins" ON public.assets
FOR ALL
USING (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM artists
    JOIN projects ON projects.artist_id = artists.id
    WHERE assets.project_id = projects.id AND artists.user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM artists
    JOIN projects ON projects.artist_id = artists.id
    WHERE assets.project_id = projects.id AND artists.user_id = auth.uid()
  )
);
