-- Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS public.assets CASCADE;

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cover_art', 'spotify_canvas', 'banner', 'thumbnail', 'press_photo', etc.
  category TEXT NOT NULL, -- 'musical_releases', 'social_media', 'press_promotion'
  file_url TEXT NOT NULL,
  file_size INTEGER,
  dimensions TEXT, -- '1080x1080', '1920x1080', etc.
  format TEXT, -- 'jpg', 'png', 'mp4', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on assets" ON public.assets
  FOR ALL USING (true);


-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_asset_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_asset_update
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_asset_update();