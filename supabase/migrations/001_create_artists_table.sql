-- Create artists table
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  country TEXT NOT NULL,
  profile_image TEXT,
  bio TEXT,
  monthly_listeners INTEGER DEFAULT 0,
  total_streams BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;


