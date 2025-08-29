ALTER TABLE public.distribution_accounts
ADD COLUMN IF NOT EXISTS distributor TEXT NOT NULL DEFAULT 'Unknown';