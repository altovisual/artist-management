-- Create social accounts table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;


