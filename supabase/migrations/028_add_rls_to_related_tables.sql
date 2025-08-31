-- Enable Row Level Security on social_accounts table
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Policy for social_accounts: Admins can view all, artists can view their own.
CREATE POLICY "Artists can view their own social accounts."
ON public.social_accounts FOR SELECT
TO authenticated
USING ((get_my_role() = 'admin') OR (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())));

-- Policy for social_accounts: Artists can insert their own social accounts
CREATE POLICY "Artists can insert their own social accounts."
ON public.social_accounts FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for social_accounts: Artists can update their own social accounts
CREATE POLICY "Artists can update their own social accounts."
ON public.social_accounts FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for social_accounts: Artists can delete their own social accounts
CREATE POLICY "Artists can delete their own social accounts."
ON public.social_accounts FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));


-- Enable Row Level Security on distribution_accounts table
ALTER TABLE public.distribution_accounts ENABLE ROW LEVEL SECURITY;

-- Policy for distribution_accounts: Admins can view all, artists can view their own.
CREATE POLICY "Artists can view their own distribution accounts."
ON public.distribution_accounts FOR SELECT
TO authenticated
USING ((get_my_role() = 'admin') OR (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())));

-- Policy for distribution_accounts: Artists can insert their own distribution accounts
CREATE POLICY "Artists can insert their own distribution accounts."
ON public.distribution_accounts FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for distribution_accounts: Artists can update their own distribution accounts
CREATE POLICY "Artists can update their own distribution accounts."
ON public.distribution_accounts FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for distribution_accounts: Artists can delete their own distribution accounts
CREATE POLICY "Artists can delete their own distribution accounts."
ON public.distribution_accounts FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));


-- Enable Row Level Security on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy for projects: Admins can view all, artists can view their own.
CREATE POLICY "Artists can view their own projects."
ON public.projects FOR SELECT
TO authenticated
USING ((get_my_role() = 'admin') OR (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())));

-- Policy for projects: Artists can insert their own projects
CREATE POLICY "Artists can insert their own projects."
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for projects: Artists can update their own projects
CREATE POLICY "Artists can update their own projects."
ON public.projects FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

-- Policy for projects: Artists can delete their own projects
CREATE POLICY "Artists can delete their own projects."
ON public.projects FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));


-- Enable Row Level Security on assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Policy for assets: Admins can view all, artists can manage their own.
CREATE POLICY "Artists can manage their own assets."
ON public.assets FOR ALL
TO authenticated
USING ((get_my_role() = 'admin') OR
  -- Case 1: Asset is linked directly to the artist
  (project_id IS NULL AND EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()))
  OR
  -- Case 2: Asset is linked to a project that belongs to the artist
  (project_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND EXISTS (SELECT 1 FROM public.artists WHERE id = public.projects.artist_id AND user_id = auth.uid())))
)
WITH CHECK ((get_my_role() = 'admin') OR
  -- Ensure the artist is not trying to assign the asset to another artist's project
  (project_id IS NULL AND EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()))
  OR
  (project_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND EXISTS (SELECT 1 FROM public.artists WHERE id = public.projects.artist_id AND user_id = auth.uid())))
);