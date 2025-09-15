ALTER TABLE public.muso_ai_profiles
ADD COLUMN IF NOT EXISTS profile_data JSONB;
