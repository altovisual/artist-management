-- Add muso_ai_profile_id column to artists table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artists' 
        AND column_name = 'muso_ai_profile_id'
    ) THEN
        ALTER TABLE public.artists 
        ADD COLUMN muso_ai_profile_id TEXT;
        
        RAISE NOTICE 'Column muso_ai_profile_id added to artists table';
    ELSE
        RAISE NOTICE 'Column muso_ai_profile_id already exists';
    END IF;
END $$;

-- Add image_url column to artists table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artists' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.artists 
        ADD COLUMN image_url TEXT;
        
        RAISE NOTICE 'Column image_url added to artists table';
    ELSE
        RAISE NOTICE 'Column image_url already exists';
    END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artists_muso_ai_profile_id 
ON public.artists(muso_ai_profile_id) 
WHERE muso_ai_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_artists_image_url 
ON public.artists(image_url) 
WHERE image_url IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.artists.muso_ai_profile_id IS 'Muso.AI profile ID for analytics integration';
COMMENT ON COLUMN public.artists.image_url IS 'URL to artist profile image';
