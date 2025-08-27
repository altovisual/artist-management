-- Add fields to distribution_accounts table
ALTER TABLE public.distribution_accounts
ADD COLUMN username TEXT,
ADD COLUMN email TEXT,
ADD COLUMN password TEXT,
ADD COLUMN notes TEXT;