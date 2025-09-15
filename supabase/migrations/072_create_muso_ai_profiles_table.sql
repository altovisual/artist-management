-- Create muso_ai_profiles table
CREATE TABLE IF NOT EXISTS public.muso_ai_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id uuid REFERENCES public.artists(id) ON DELETE CASCADE,
    muso_ai_profile_id text UNIQUE NOT NULL, -- Muso.AI's internal profile ID
    popularity integer,
    last_updated timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policy for muso_ai_profiles
ALTER TABLE public.muso_ai_profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Enable read access for all users" ON public.muso_ai_profiles
-- FOR SELECT USING (true);

-- CREATE POLICY "Enable insert for authenticated users" ON public.muso_ai_profiles
-- FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Enable update for authenticated users" ON public.muso_ai_profiles
-- FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.artists WHERE id = artist_id)) WITH CHECK (auth.uid() = (SELECT user_id FROM public.artists WHERE id = artist_id));

-- CREATE POLICY "Enable delete for authenticated users" ON public.muso_ai_profiles
-- FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.artists WHERE id = artist_id));

-- Allow admin to manage all muso_ai_profiles
-- CREATE POLICY "Admins can manage all muso_ai_profiles" ON public.muso_ai_profiles
-- FOR ALL USING (auth.role() = 'admin');