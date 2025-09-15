-- Create the signatures table
CREATE TABLE IF NOT EXISTS public.signatures (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    contract_id BIGINT NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    signature_request_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    signer_email TEXT NOT NULL,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for the new table
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new table
-- CREATE POLICY "Allow read access to all users" ON public.signatures FOR SELECT USING (true);
