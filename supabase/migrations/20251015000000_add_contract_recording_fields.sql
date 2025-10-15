-- Add recording and publishing fields to contracts table
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS artist_name TEXT,
ADD COLUMN IF NOT EXISTS record_label TEXT,
ADD COLUMN IF NOT EXISTS recording_date DATE,
ADD COLUMN IF NOT EXISTS publisher_ipi TEXT;

-- Add PRO field to participants table
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS pro TEXT;

-- Add PRO field to contract_participants table (for contract-specific PRO)
ALTER TABLE public.contract_participants
ADD COLUMN IF NOT EXISTS pro TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.contracts.artist_name IS 'Name of the artist performing the work';
COMMENT ON COLUMN public.contracts.record_label IS 'Record label associated with the recording';
COMMENT ON COLUMN public.contracts.recording_date IS 'Date when the work was recorded';
COMMENT ON COLUMN public.contracts.publisher_ipi IS 'IPI number of the publisher';
COMMENT ON COLUMN public.participants.pro IS 'Performing Rights Organization (PRO) of the participant';
COMMENT ON COLUMN public.contract_participants.pro IS 'PRO specified for this specific contract (overrides participant default)';
