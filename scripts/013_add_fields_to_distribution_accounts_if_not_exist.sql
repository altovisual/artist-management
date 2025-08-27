-- Add fields to distribution_accounts table if they do not exist
ALTER TABLE public.distribution_accounts
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;