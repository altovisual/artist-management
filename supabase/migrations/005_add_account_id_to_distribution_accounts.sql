-- Add account_id to distribution_accounts table
ALTER TABLE public.distribution_accounts
ADD COLUMN IF NOT EXISTS account_id TEXT;
