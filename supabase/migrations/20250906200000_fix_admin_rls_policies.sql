-- Drop existing policies to avoid conflicts from previous migrations
DROP POLICY IF EXISTS "Artists can view their own social accounts." ON public.social_accounts;
DROP POLICY IF EXISTS "Artists can insert their own social accounts." ON public.social_accounts;
DROP POLICY IF EXISTS "Artists can update their own social accounts." ON public.social_accounts;
DROP POLICY IF EXISTS "Artists can delete their own social accounts." ON public.social_accounts;
DROP POLICY IF EXISTS "Enable CRUD for owners and admins" ON public.social_accounts;

DROP POLICY IF EXISTS "Artists can view their own distribution accounts." ON public.distribution_accounts;
DROP POLICY IF EXISTS "Artists can insert their own distribution accounts." ON public.distribution_accounts;
DROP POLICY IF EXISTS "Artists can update their own distribution accounts." ON public.distribution_accounts;
DROP POLICY IF EXISTS "Artists can delete their own distribution accounts." ON public.distribution_accounts;
DROP POLICY IF EXISTS "Enable CRUD for owners and admins" ON public.distribution_accounts;

DROP POLICY IF EXISTS "Artists can view their own projects." ON public.projects;
DROP POLICY IF EXISTS "Artists can insert their own projects." ON public.projects;
DROP POLICY IF EXISTS "Artists can update their own projects." ON public.projects;
DROP POLICY IF EXISTS "Artists can delete their own projects." ON public.projects;
DROP POLICY IF EXISTS "Enable CRUD for owners and admins" ON public.projects;

-- RLS Policies for 'social_accounts' table
CREATE POLICY "Enable CRUD for owners and admins on social_accounts" ON public.social_accounts
FOR ALL
USING (
  (public.is_admin()) OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = social_accounts.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  (public.is_admin()) OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = social_accounts.artist_id AND artists.user_id = auth.uid())
);

-- RLS Policies for 'distribution_accounts' table
CREATE POLICY "Enable CRUD for owners and admins on distribution_accounts" ON public.distribution_accounts
FOR ALL
USING (
  (public.is_admin()) OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = distribution_accounts.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  (public.is_admin()) OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = distribution_accounts.artist_id AND artists.user_id = auth.uid())
);

-- RLS Policies for 'projects' table
CREATE POLICY "Enable CRUD for owners and admins on projects" ON public.projects
FOR ALL
USING (
  (public.is_admin()) OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = projects.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  (public.is_admin()) OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = projects.artist_id AND artists.user_id = auth.uid())
);
