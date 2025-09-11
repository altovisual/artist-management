-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Artists can view their own social accounts." ON public.social_accounts;
DROP POLICY IF EXISTS "Artists can insert their own social accounts." ON public.social_accounts;
DROP POLICY IF EXISTS "Artists can update their own social accounts." ON public.social_accounts;
DROP POLICY IF EXISTS "Artists can delete their own social accounts." ON public.social_accounts;

DROP POLICY IF EXISTS "Artists can view their own distribution accounts." ON public.distribution_accounts;
DROP POLICY IF EXISTS "Artists can insert their own distribution accounts." ON public.distribution_accounts;
DROP POLICY IF EXISTS "Artists can update their own distribution accounts." ON public.distribution_accounts;
DROP POLICY IF EXISTS "Artists can delete their own distribution accounts." ON public.distribution_accounts;

DROP POLICY IF EXISTS "Artists can view their own projects." ON public.projects;
DROP POLICY IF EXISTS "Artists can insert their own projects." ON public.projects;
DROP POLICY IF EXISTS "Artists can update their own projects." ON public.projects;
DROP POLICY IF EXISTS "Artists can delete their own projects." ON public.projects;

-- RLS Policies for 'social_accounts' table
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'distribution_accounts' table
ALTER TABLE public.distribution_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'projects' table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;


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