-- Enable Row Level Security on social_accounts table
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Policy for social_accounts: Artists can view their own social accounts
CREATE POLICY "Artists can view their own social accounts."
ON public.social_accounts FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

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

-- Policy for distribution_accounts: Artists can view their own distribution accounts
CREATE POLICY "Artists can view their own distribution accounts."
ON public.distribution_accounts FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

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

-- Policy for projects: Artists can view their own projects
CREATE POLICY "Artists can view their own projects."
ON public.projects FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid()));

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

-- Policy for assets: Artists can view their own assets
CREATE POLICY "Artists can view their own assets."
ON public.assets FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())));

-- Policy for assets: Artists can insert their own assets
CREATE POLICY "Artists can insert their own assets."
ON public.assets FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())));

-- Policy for assets: Artists can update their own assets
CREATE POLICY "Artists can update their own assets."
ON public.assets FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())));

-- Policy for assets: Artists can delete their own assets
CREATE POLICY "Artists can delete their own assets."
ON public.assets FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND EXISTS (SELECT 1 FROM public.artists WHERE id = artist_id AND user_id = auth.uid())));