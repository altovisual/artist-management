-- Add password to social_accounts table
ALTER TABLE public.social_accounts
ADD COLUMN password TEXT;