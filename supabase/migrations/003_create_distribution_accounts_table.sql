-- Create distribution accounts table
CREATE TABLE IF NOT EXISTS public.distribution_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  monthly_listeners INTEGER DEFAULT 0,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.distribution_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on distribution_accounts" ON public.distribution_accounts
  FOR ALL USING (true);
