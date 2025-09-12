-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- e.g., 'ARTIST', 'MANAGER', 'PRODUCER', 'SONGWRITER'
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    id_number TEXT,
    address TEXT,
    country TEXT,
    phone TEXT,
    bank_info JSONB, -- Using JSONB to store structured bank information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_type ON public.participants(type);

-- Add a comment to explain the purpose of the table
COMMENT ON TABLE public.participants IS 'Stores information about all participants (artists, managers, producers, etc.) in the CRM.';

-- Grant permissions to Supabase roles
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.participants TO authenticated;
GRANT ALL ON TABLE public.participants TO service_role;

-- Add a basic RLS policy for SELECT
CREATE POLICY "Public participants are viewable by everyone."
ON public.participants FOR SELECT
USING (true);
