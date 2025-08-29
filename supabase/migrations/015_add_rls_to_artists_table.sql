-- Enable Row Level Security on the artists table
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to SELECT their own artist profile
CREATE POLICY "Artists can view their own profile."
ON public.artists FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a policy to allow authenticated users to INSERT their own artist profile
CREATE POLICY "Artists can create their own profile."
ON public.artists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow authenticated users to UPDATE their own artist profile
CREATE POLICY "Artists can update their own profile."
ON public.artists FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow authenticated users to DELETE their own artist profile
CREATE POLICY "Artists can delete their own profile."
ON public.artists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);