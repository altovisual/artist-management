-- Create the contracts table
CREATE TABLE public.contracts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    work_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft',
    final_contract_pdf_url TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the contract_participants join table
CREATE TABLE public.contract_participants (
    contract_id BIGINT NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    PRIMARY KEY (contract_id, participant_id)
);

-- Enable RLS for the new tables
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new tables
CREATE POLICY "Allow read access to all users" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Allow read access to all users" ON public.contract_participants FOR SELECT USING (true);
