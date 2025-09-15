-- Add columns to public.projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS alternative_title TEXT,
ADD COLUMN IF NOT EXISTS iswc TEXT;

-- Add columns to public.participants
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS artistic_name TEXT,
ADD COLUMN IF NOT EXISTS management_entity TEXT,
ADD COLUMN IF NOT EXISTS ipi TEXT;

-- Add columns to public.contract_participants
ALTER TABLE public.contract_participants
ADD COLUMN IF NOT EXISTS percentage NUMERIC;

-- Add columns to public.contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS internal_reference TEXT,
ADD COLUMN IF NOT EXISTS signing_location TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS publisher_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS co_publishers TEXT,
ADD COLUMN IF NOT EXISTS publisher_admin TEXT;
